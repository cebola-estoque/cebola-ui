angular.module('cebola.services')
.factory('uiOperationDialog', function ($mdDialog, cebolaAPI, $filter) {
  
  /**
   * [CorrectionOperationDialog description]
   * @param {[type]} $scope    [description]
   * @param {[type]} operation [description]
   */
  function CorrectionOperationDialog($scope, operation) {
    $scope.operation = operation;

    
    $scope.completeAvailableProducts = function (searchText) {
      return cebolaAPI.inventory.availabilitySummary(new Date()).then(function (availableProductsSummary) {
        // var availableProductModels = availableProductsSummary.map(function (productSummary) {
        //   return productSummary.product.model;
        // })
        // .filter(function firstOccurringOnly(productModel, index, self) {
        //   // Elegant solution for ensuring uniqueness taken from:
        //   // http://stackoverflow.com/questions/1960473/unique-values-in-an-array
        //   return self.findIndex(function (_pm) {
        //     return _pm._id === productModel._id;
        //   }) === index;
        // });

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
        
        // console.log(availableProducts[0].model.description);
        
        console.log(searchText);
        
        console.log($filter('filter')(availableProducts, {
          model: {
            description: searchText
          }
        }))
        
        return $filter('filter')(availableProducts, {
          model: {
            description: searchText
          }
        });
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

  function StandaloneOperationDialog($scope, operation) {
    $scope.operation = operation;
    
    $scope.completeProductModels = function (searchText) {  
      return cebolaAPI.productModel.search(searchText);
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
