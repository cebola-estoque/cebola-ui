angular.module('cebola.controllers')
.controller('EntryShipmentDetailCtrl', function (
  $scope,
  $state,
  $stateParams,
  cebolaAPI,
  uiAllocationDialog,
  uiOperationDialog,
  uiDialogEntryShipment,
  $mdDialog,
  $location
) {
  
  $scope.shipment = {};
  
  $scope.loadShipment = function () {
    return cebolaAPI.shipment.getById($stateParams.entryShipmentId).then(function (shipment) {
      $scope.shipment = shipment;

      console.log(shipment);
    });
  };
  
  $scope.finishShipment = function () {
    return uiDialogEntryShipment.finish($scope.shipment)
      .then((finishedShipment) => {
        return cebolaAPI.shipment.update(
          $scope.shipment._id,
          finishedShipment
        );
      })
      .then(function (shipment) {
        return cebolaAPI.shipment.finish($scope.shipment._id);
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
    return uiAllocationDialog.effectivateEntry(allocation)
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

  $scope.createStandaloneOperation = function () {
    return uiOperationDialog.createStandalone({})
      .then(function (operation) {
        return cebolaAPI.shipment.createOperations($scope.shipment._id, [operation]);
        // console.log(operation);
      })
      .then(function (createdOperation) {
        console.log('created operation');
        return $scope.loadShipment();
      })
      .catch(function (err) {
        if (!err) {
          return;
        }

        throw err;
      })
  };

  $scope.cancelShipment = function () {
    return $mdDialog.show(
      $mdDialog.confirm()
        .title('Uma entrada cancelada não poderá mais ser editada. Confirma cancelamento?')
        .ok('Cancelar entrada')
        .cancel('cancelar')
    )
    .then(function () {
      return cebolaAPI.shipment.cancel($scope.shipment._id);
    })
    .then(function () {
      return $scope.loadShipment();
      // alert('CANCELLED!')
    })
    .catch(function (err) {
      if (!err) {
        return;
      }

      throw err;
    })
    
  };
  
  // initialize
  $scope.loadShipment();
});
