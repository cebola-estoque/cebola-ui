angular.module('cebola.services')
.factory('uiOperationDialog', function ($mdDialog, cebolaAPI, $filter) {
  
  /**
   * CorrectionOperationDialog
   */
  function CorrectionOperationDialog($scope, $rootScope, operation, dialogOptions) {

    $scope.FORM_SUPPORT = $rootScope.FORM_SUPPORT;

    console.log('CorrectionOperationDialog', operation, dialogOptions);

    // normalize data
    if (operation && operation.product && operation.product.expiry) {
      operation.product.expiry = (typeof operation.product.expiry === 'string') ?
        new Date(operation.product.expiry) :
        operation.product.expiry;
    }

    $scope.operation = operation || {};
    $scope.dialogOptions = Object.assign({
      productType: undefined, // in-stock / out-of-stock
      correctionType: undefined, // addition / subtraction / loss 
    }, dialogOptions);

    if ($scope.dialogOptions.correctionType === 'loss') {
      $scope.dialogOptions.productType = 'in-stock';
    }

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

      console.log('completeAvailableProducts')

      return cebolaAPI.inventory.availabilitySummary(new Date()).then(function (availableProductsSummary) {

        var availableProducts = availableProductsSummary.map(function (productSummary) {
          return {
            model: productSummary.product.model,
            measureUnit: productSummary.product.measureUnit,
            expiry: new Date(productSummary.product.expiry),
            sourceShipment: productSummary.product.sourceShipment,
            unitPrice: productSummary.product.unitPrice,
            
            inStock: productSummary.inStock,
            allocatedForEntry: productSummary.allocatedForEntry,
            allocatedForExit: productSummary.allocatedForExit,
          };
        });

        console.log(availableProducts);
        
        return $filter('filter')(availableProducts, {
          model: {
            description: searchText
          }
        });
      });
    };

    /**
     * Change dialogOptions.productType when correctionType is modified
     * to 'loss'
     */
    $scope.$watch('dialogOptions.correctionType', function (newCorrectionType) {
      if (newCorrectionType === 'loss') {
        $scope.dialogOptions.productType = 'in-stock';
      }
    });

    /**
     * Reset the operation product data in case
     * the dialogOptions.productType is modified
     */
    $scope.$watch('dialogOptions.productType', function (newProductType, oldProductType) {

      if (oldProductType && (oldProductType !== newProductType)) {
        // change ocurred
        $scope.operation.product = undefined;
      }
    });
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    $scope.submit = function () {
      var operation = angular.copy($scope.operation);

      // modify the operation quantity according to the correction's
      // operation type
      if ($scope.dialogOptions.correctionType === 'addition') {
        operation.quantity = operation.quantity;
      } else if ($scope.dialogOptions.correctionType === 'subtraction' ||
                 $scope.dialogOptions.correctionType === 'loss') {
        operation.quantity = -1 * operation.quantity;
      }

      console.log(operation);

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
    createCorrection: function (operationTemplate, dialogOptions) {
      // operationTemplate = operationTemplate || {};
      // dialogOptions = dialogOptions || {};

      console.log('createCorrection',operationTemplate, dialogOptions)

      return $mdDialog.show({
        multiple: true,
        templateUrl: 'templates/dialogs/operation/correction.html',
        controller: CorrectionOperationDialog,
        locals: {
          operation: operationTemplate,
          dialogOptions: dialogOptions,
        },
      });
    },

    createStandalone: function (operationTemplate) {
      operationTemplate = operationTemplate || {};

      return $mdDialog.show({
        multiple: true,
        templateUrl: 'templates/dialogs/operation/standalone.html',
        controller: StandaloneOperationDialog,
        locals: {
          operation: operationTemplate
        },
      });
    },
  };
  
});
