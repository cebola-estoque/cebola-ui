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
      return cebolaAPI.productModel.list().then(function (productModels) {
        // 
        // DOES NOT MAKE SENSE, as a productModel may come in two measure units
        // or in two different expiry dates
        // 
        // /**
        //  * Prevent products models already allocated in current
        //  * shipment to be reallocated.
        //  */
        // productModels = productModels.filter(function (productModel) {
        //   return !$scope.shipment.allocations.active.some(function (allocation) {
        //     return allocation.product &&
        //            allocation.product.model &&
        //            util.product.isSameModel(
        //             allocation.product.model,
        //             productModel
        //            );
        //   });
        // });

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
