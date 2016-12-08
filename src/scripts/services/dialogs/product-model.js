angular.module('cebola.services')
.factory('uiProductModelDialog', function ($mdDialog, $q) {
  
  
  function ProductModelDialogCtrl(productModel, $scope, $mdDialog) {
    
    /**
     * Product model either has been injected or
     * should be a completely new one.
     */
    $scope.productModel = productModel || {};
    
    $scope.submit = function () {
      $mdDialog.hide($scope.productModel);
    };
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    }
  }
  
  return {
    create: function (productModelTemplate) {
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/product-model.html',
        controller: ProductModelDialogCtrl,
        locals: {
          productModel: productModelTemplate
        },
      });
      
    },
    
    edit: function (productModel) {
      if (!productModel) {
        throw new Error('productModel is required');
      }
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/product-model.html',
        controller: ProductModelDialogCtrl,
        locals: {
          productModel: productModel,
        },
        // we might use resolve sometime..
        // resolve: {
        //   productModel: $q.resolve(productModel),
        // },
      });
      
    },
  };
  
});
