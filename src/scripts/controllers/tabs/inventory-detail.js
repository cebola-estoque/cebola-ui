angular.module('cebola.controllers')
.controller('InventoryDetailCtrl', function (
  $scope,
  $state,
  $stateParams,
  cebolaAPI
) {
  $scope.loadSummary = function () {
    return cebolaAPI.inventory.summary({
      'product.model._id': $stateParams.productModelId,
    }).then(function (summary) {
      $scope.summary = summary;
      
      console.log(summary);
    });
  };

  $scope.loadSummary();
});
