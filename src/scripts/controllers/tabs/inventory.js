angular.module('cebola.controllers')
.controller('InventoryCtrl', function ($scope, $filter, cebolaAPI, uiOperationDialog) {
  
  $scope.loadSummary = function () {
    return cebolaAPI.inventory.summary().then(function (summary) {
      $scope.summary = summary;

      $scope.summaries = {
        error: summary.filter(function hasError(productSummary) {

          var hasNegativeStock = productSummary.inStock < 0;
          var isOverallocated  = productSummary.inStock + productSummary.allocatedForEntry + productSummary.allocatedForExit < 0;

          return hasNegativeStock || isOverallocated;
        }),
        inStock: summary.filter(function isInStock(productSummary) {
          return !$scope.hasError(productSummary) && productSummary.inStock > 0;
        }),
        expected: summary.filter(function isOutOfStockButExpected(productSummary) {
          return productSummary.inStock === 0 && productSummary.allocatedForEntry > 0;
        })
      };

      // console.log(summary.map(i => {
      //   return {
      //     inStock: i.inStock,
      //     forExit: i.allocatedForExit,
      //     forEntry: i.allocatedForEntry,
      //   }
      // }));
    });
  };
  
  // filter related methods
  $scope.isInStock = function (productSummary) {
    return !$scope.hasError(productSummary) && productSummary.inStock > 0;
  };
  
  $scope.isOutOfStockButExpected = function (productSummary) {
    return productSummary.inStock === 0 && productSummary.allocatedForEntry > 0;
  };
  
  $scope.hasError = function (productSummary) {

    var hasNegativeStock = productSummary.inStock < 0;
    var isOverallocated  = productSummary.inStock + productSummary.allocatedForEntry + productSummary.allocatedForExit < 0;

    return hasNegativeStock || isOverallocated;
  };
  
  $scope.isEntryAllocationRecord = function (record) {
    return record.kind === 'ProductAllocation' && record.type === 'entry';
  };
  
  $scope.isExitAllocationRecord = function (record) {
    return record.kind === 'ProductAllocation' && record.type === 'exit';
  };

  $scope.createLossRecord = function (operationTemplate, dialogOptions) {
    dialogOptions = dialogOptions || {};
    dialogOptions.correctionType = 'loss';

    uiOperationDialog.createCorrection(operationTemplate, dialogOptions)
      .then(function (lossOperation) {
        return cebolaAPI.operation.createLoss(lossOperation);
      })
      .then(function () {
        return $scope.loadSummary();
      })
      .catch(function (err) {
        if (!err) {
          console.log('CANCELLED');
          return;
        }

        alert('houve um erro ao cadastrar a perda');
        throw err;
      });
  };

  $scope.createCorrectionRecord = function (operationTemplate, dialogOptions) {
    dialogOptions = dialogOptions || {};

    uiOperationDialog.createCorrection(operationTemplate, dialogOptions)
      .then(function (correctionOperation) {
        return cebolaAPI.operation.createCorrection(correctionOperation);
      })
      .then(function () {
        return $scope.loadSummary();
      })
      .catch(function (err) {
        if (!err) {
          console.log('CANCELLED');
          return;
        }

        alert('houve um erro ao cadastrar a correção');
        throw err;
      });
  };

  $scope.inventoryTableMethods = {
    createLossRecord: $scope.createLossRecord,
    createCorrectionRecord: $scope.createCorrectionRecord,
  };
  
  // initialize
  $scope.loadSummary();
});
