angular.module('cebola.controllers')
.controller('OperationsCtrl', function ($scope, $stateParams, $mdDialog, cebolaAPI) {
  
  var TAB_ROLE = $stateParams.role;
  
  // initialize data objects
  $scope.operations = [];
  
  $scope.listOperations = function () {
    return cebolaAPI.operation.list()
    .then(function (operations) {
      $scope.operations = operations;

      console.log(operations[operations.length - 1]);
    });
  };
  
  $scope.listOperations();
});
