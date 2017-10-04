angular.module('cebola.controllers')
.controller('ProductModelsCtrl', function ($scope, $mdDialog, uiProductModelDialog, uiErrorDialog, cebolaAPI) {
  
  /**
   * Loads product models from server into the $scope
   */
  $scope.listProductModels = function (query) {
    return cebolaAPI.productModel.list(query)
      .then(function (productModels) {
        $scope.productModels = productModels;
      })
      .catch(function (err) {
        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao carregar dados dos modelos de produtos. Por favor tente recarregar a página.',
        });

        throw err;
      });
  };
  
  /**
   * Opens the productModel dialog for edition
   */
  $scope.editProductModel = function (sourceProductModel) {
    uiProductModelDialog.edit(sourceProductModel)
      .then(function (intendedProductModel) {
        return cebolaAPI.productModel.update(
          sourceProductModel._id,
          intendedProductModel
        );
      })
      .then(function (updatedProductModel) {
        console.log('updated product model', updatedProductModel);
      })
      .catch(function (err) {
        if (!err) {
          // cancelled
          return;
        }

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao editar dados do modelo de produto. Por favor tente novamente.',
        });

        throw err;
      });
  };
  
  /**
   * Opens a dialog to confirm that the user wants to delete the
   * product
   */
  $scope.deleteProductModel = function (productModel) {
    return $mdDialog.show(
      $mdDialog.confirm()
        .title('Delete "' + productModel.description + '" ?')
        .ok('delete')
        .cancel('cancel')
    )
    .then(function () {
      return cebolaAPI.productModel.delete(productModel._id);
    })
    .then(function () {
      
      // remove from scope
      var index = $scope.productModels.findIndex(function (p) {
        return p._id === productModel._id;
      });
      
      if (index !== -1) {
        $scope.productModels.splice(index, 1);
      }
    })
    .catch(function (err) {
      if (!err) {
        // cancelled
        return;
      }

      uiErrorDialog.alert({
        textContent: 'Ocorreu um erro ao remover o modelo de produto. Por favor tente novamente.',
      });

      throw err;
    });
  };
  
  /**
   * Opens the dialog for a new product model
   */
  $scope.createProductModel = function () {
    uiProductModelDialog.create()
      .then(function (productModel) {
        return cebolaAPI.productModel.create(productModel)
      })
      .then(function (productModel) {
        $scope.productModels.push(productModel);
      })
      .catch(function (err) {
        if (!err) {
          // cancelled
          return;
        }

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao cadastrar o modelo de produto. Por favor tente novamente.',
        });

        throw err;
      });
  };
  
  // filter-related methods
  $scope.hasDimensions = function (productModel) {
    return (productModel.width !== undefined) &&
           (productModel.height !== undefined) &&
           (productModel.depth !== undefined);
  };
  
  // initialize data loading
  $scope.listProductModels();
  
});
