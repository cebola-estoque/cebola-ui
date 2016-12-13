angular.module('cebola.controllers')
.controller('EntryShipmentDetailCtrl', function ($scope, $stateParams, cebolaAPI, uiAllocationDialog) {
  
  $scope.shipment = {};
  $scope.allocations = [];
  
  $scope.loadShipment = function () {
    return cebolaAPI.shipment.getById($stateParams.entryShipmentId).then(function (shipment) {
      $scope.shipment = shipment;
      
      // shipment allocations
      $scope.allocations = shipment.records.filter(function (record) {
        return record.kind === 'ProductAllocation';
      });
    });
  };
  
  $scope.effectivateEntryAllocation = function (allocation) {
    return uiAllocationDialog.effectivate(allocation)
    .catch(function () {
      // user cancelled
      throw new Error('CANCELLED');
    })
    .then(function (effectivatedQuantity) {
      console.log('effectivate: ', effectivatedQuantity);
    });
  };
  
  // initialize
  $scope.loadShipment();
});
