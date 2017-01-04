angular.module('cebola.controllers')
.controller('InventoryCtrl', function ($scope, cebolaAPI) {
  
  $scope.loadSummary = function () {
    return cebolaAPI.inventory.summary().then(function (summary) {
      $scope.summary = summary;
      
      console.log(summary);
    });
  };
  
  // filter related methods
  $scope.isInStock = function (productSummary) {
    return productSummary.inStock > 0;
  };
  
  $scope.isOutOfStockButExpected = function (productSummary) {
    return productSummary.inStock === 0 && productSummary.allocatedForEntry > 0;
  };
  
  $scope.hasError = function (productSummary) {
    return productSummary.inStock < 0;
  };
  
  $scope.isEntryAllocationRecord = function (record) {
    return record.kind === 'ProductAllocation' && record.type === 'entry';
  };
  
  $scope.isExitAllocationRecord = function (record) {
    return record.kind === 'ProductAllocation' && record.type === 'exit';
  };
  
  // initialize
  $scope.loadSummary();
});
