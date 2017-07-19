angular.module('cebola.controllers')
.controller('EntryShipmentDetailCtrl', function (
  $scope,
  $state,
  $stateParams,
  cebolaAPI,
  uiAllocationDialog,
  uiDialogShipment,
  $mdDialog
) {
  
  $scope.shipment = {};
  $scope.allocations = [];
  
  $scope.loadShipment = function () {
    return cebolaAPI.shipment.getById($stateParams.entryShipmentId).then(function (shipment) {
      $scope.shipment = shipment;

      console.log(shipment);
    });
  };
  
  $scope.finishShipment = function () {
    return uiDialogShipment.finish($scope.shipment)
      .then((annotations) => {
        return cebolaAPI.shipment.finish($scope.shipment._id, {
          annotations: annotations
        });
      })
      .then(function (shipment) {
        return $scope.loadShipment();
      })
      .catch(function (err) {
        if (!err) {
          console.log('CANCELLED');
          return;
        }

        throw err;
      });
  };
  
  $scope.effectivateEntryAllocation = function (allocation) {
    return uiAllocationDialog.effectivate(allocation)
    .catch(function () {
      // user cancelled
      throw new Error('CANCELLED');
    })
    .then(function (quantity) {
      console.log('effectivate: ', quantity);
      
      var effectivationExcess = quantity - (allocation.allocatedQuantity - allocation.effectivatedQuantity);
      
      if (effectivationExcess > 0) {
        
        return $mdDialog.show(
          $mdDialog.confirm()
            .title('Quantidade a ser efetivada excede quantidade alocada em ' + effectivationExcess + '. Confirma efetivação?')
            .ok('efetivar')
            .cancel('cancelar')
        )
        .catch(function () {
          // user cancelled
          var err = new Error('UserCancelled');
          err.cancelled = true;
          throw err;
        })
        .then(function () {
          return quantity;
        });
        
      } else {
        return quantity;
      }
    })
    .then((quantity) => {
      return cebolaAPI.shipment.effectivateAllocation(
        allocation.shipment._id,
        allocation._id,
        quantity
      );
    })
    .then(function (operation) {
      // reload the shipment
      return $scope.loadShipment();
    })
    .catch(function (err) {
      if (err.cancelled) {
        console.warn('user cancelled');
      } else {
        // alert('error');
        console.warn(err);
      }
    });
  };
  
  // initialize
  $scope.loadShipment();
});
