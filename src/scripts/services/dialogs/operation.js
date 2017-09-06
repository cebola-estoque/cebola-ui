angular.module('cebola.services')
.factory('uiOperationDialog', function ($mdDialog, cebolaAPI, $filter) {
  
  /**
   * [CorrectionOperationDialog description]
   * @param {[type]} $scope    [description]
   * @param {[type]} operation [description]
   */
  function CorrectionOperationDialog($scope, operation) {
    $scope.operation = operation || {};

    $scope._productType; // in-stock / out-of-stock
    
    $scope.completeProductModels = function (searchText) {
      return cebolaAPI.productModel.list().then(function (productModels) {

        // filter using searchText
        productModels = $filter('filter')(productModels, {
          description: searchText,
        });

        // sort
        productModels = $filter('orderBy')(productModels, 'description');

        return productModels;
      });
    };

    $scope.completeAvailableProducts = function (searchText) {
      return cebolaAPI.inventory.availabilitySummary(new Date()).then(function (availableProductsSummary) {

        var availableProducts = availableProductsSummary.map(function (productSummary) {
          return {
            model: productSummary.product.model,
            measureUnit: productSummary.product.measureUnit,
            expiry: new Date(productSummary.product.expiry),
            
            inStock: productSummary.inStock,
            allocatedForEntry: productSummary.allocatedForEntry,
            allocatedForExit: productSummary.allocatedForExit,
          };
        });
        
        return $filter('filter')(availableProducts, {
          model: {
            description: searchText
          }
        });
      });
    };

    /**
     * Reset the operation product data in case
     * the _productType is modified
     */
    $scope.$watch('_productType', function () {
      $scope.operation.product = undefined;
    })
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    $scope.submit = function () {
      var operation = angular.copy($scope.operation);

      // modify the operation quantity according to the correction's
      // operation type
      if (operation.type === 'entry') {
        operation.quantity = operation.quantity;
      } else if (operation.type === 'exit') {
        operation.quantity = -1 * operation.quantity;
      }

      $mdDialog.hide(operation);
    };
  }

  function StandaloneOperationDialog($scope, operation) {
    $scope.operation = operation;
    
    $scope.completeProductModels = function (searchText) {
      return cebolaAPI.productModel.list().then(function (productModels) {

        // filter using searchText
        productModels = $filter('filter')(productModels, {
          description: searchText,
        });

        // sort
        productModels = $filter('orderBy')(productModels, 'description');

        return productModels;
      });
    };
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    $scope.submit = function () {
      $mdDialog.hide($scope.operation);
    };
  }
  
  return {
    createLoss: function (operationTemplate) {

      operationTemplate = operationTemplate || {};

      return $mdDialog.show({
        templateUrl: 'templates/dialogs/operation/loss.html',
        controller: CorrectionOperationDialog,
        locals: {
          operation: operationTemplate
        },
      });
    },

    createCorrection: function (operationTemplate) {
      operationTemplate = operationTemplate || {};

      return $mdDialog.show({
        templateUrl: 'templates/dialogs/operation/correction.html',
        controller: CorrectionOperationDialog,
        locals: {
          operation: operationTemplate
        },
      });
    },

    createStandalone: function (operationTemplate) {
      operationTemplate = operationTemplate || {};

      return $mdDialog.show({
        templateUrl: 'templates/dialogs/operation/standalone.html',
        controller: StandaloneOperationDialog,
        locals: {
          operation: operationTemplate
        },
      });
    },
  };
  
});
