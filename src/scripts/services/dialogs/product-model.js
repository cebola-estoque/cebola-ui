angular.module('cebola.services')
.factory('uiProductModelDialog', function ($mdDialog, $q) {
  
  
  function ProductModelDialogCtrl(productModel, $scope, $mdDialog, Upload, CONFIG) {
    
    /**
     * Product model either has been injected or
     * should be a completely new one.
     */
    $scope.productModel = productModel || {};

    $scope.uploadPhoto = function ($file) {

      if (!$file) {

        return;
      }

      Upload.upload({
        url: CONFIG.cebolaApiURI + '/files',
        data: {
          file: $file
        }
      })
      .then(function (resp) {
        console.log('Success', resp);

        $scope.productModel.image = resp.data;

        $scope._uploadedPercentage = false;

      }, function (resp) {
        console.log('Error status: ' + resp.status);

        $scope._uploadedPercentage = false;
      }, function (evt) {
        $scope._uploadedPercentage = parseInt(100 * evt.loaded / evt.total) + '%';

        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });
    };

    $scope.removePhoto = function () {
      $scope.productModel.image = null;
    };
    
    $scope.submit = function () {
      $mdDialog.hide($scope.productModel);
    };
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
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
