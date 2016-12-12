angular.module('cebola.controllers')
.controller('EntryShipmentDetailCtrl', function ($scope, $stateParams, cebolaAPI) {
  
  $scope.shipment = {};
  
  $scope.loadShipment = function () {
    return cebolaAPI.shipment.getById($stateParams.entryShipmentId).then(function (shipment) {
      $scope.shipment = shipment;
    });
  };
  
  $scope.loadShipmentSummary = function () {
    return cebolaAPI.inventory.shipmentSummary($stateParams.entryShipmentId).then(function (summary) {
      $scope.entryShipmentSummary = summary;
      
      console.log(summary);
    });
  };
  
  // initialize
  $scope.loadShipment();
  $scope.loadShipmentSummary();
});
