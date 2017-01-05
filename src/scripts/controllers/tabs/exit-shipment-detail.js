angular.module('cebola.controllers')
.controller('ExitShipmentDetailCtrl', function ($scope, $stateParams, cebolaAPI, uiAllocationDialog, $mdDialog) {
  
  $scope.shipment = {};
  $scope.allocations = [];
  
  $scope.loadShipment = function () {
    return cebolaAPI.shipment.getById($stateParams.exitShipmentId).then(function (shipment) {
      $scope.shipment = shipment;
    });
  };
  
  // initialize
  $scope.loadShipment();
});
