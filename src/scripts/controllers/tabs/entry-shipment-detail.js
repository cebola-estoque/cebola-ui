angular.module('cebola.controllers')
.controller('EntryShipmentDetailCtrl', function ($scope, $stateParams, cebolaAPI, uiAllocationDialog, $mdDialog) {
  
  $scope.shipment = {};
  $scope.allocations = [];
  
  $scope.loadShipment = function () {
    return cebolaAPI.shipment.getById($stateParams.entryShipmentId).then(function (shipment) {
      $scope.shipment = shipment;
    });
  };
  
  $scope.finishShipment = function () {
    return cebolaAPI.shipment.finish($scope.shipment._id, {
      observations: [
        {
          title: 'Test observation title',
          body: 'Test observation body',
          author: 'test-author',
          createdAt: Date.now(),
        }
      ]
    })
    .then(function (shipment) {
      $scope.shipment = shipment;
    })
    .catch(function (err) {
      alert('error finishing shipment');
      console.warn(err);
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
          throw new Error('CANCELLED');
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
      console.log('effectivated', operation);
      
      // reload the shipment
      return $scope.loadShipment();
    })
    .catch(function (err) {
      alert('error!');
      console.warn(err);
    });
  };
  
  // initialize
  $scope.loadShipment();
});
