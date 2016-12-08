angular.module('cebola.services')
.factory('uiSupplierOrganizationDialog', function ($mdDialog, $q) {
  
  // TODO: unify organization dialogs
  
  function SupplierOrganizationDialogCtrl(supplierOrganization, $scope, $mdDialog) {
    
    $scope.supplierOrganization = supplierOrganization || {};
    $scope.supplierOrganization.roles =
      $scope.supplierOrganization.roles || ['supplier'];
    $scope.supplierOrganization.addresses =
      $scope.supplierOrganization.addresses || [{}];
    
    $scope.addAddress = function () {
      $scope.supplierOrganization.addresses.push({});
    };
    
    $scope.submit = function () {
      $mdDialog.hide($scope.supplierOrganization);
    };
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    }
  }
  
  return {
    create: function (supplierOrganizationTemplate) {
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/supplier-organization.html',
        controller: SupplierOrganizationDialogCtrl,
        locals: {
          supplierOrganization: supplierOrganizationTemplate
        },
      });
      
    },
    
    edit: function (supplierOrganization) {
      if (!supplierOrganization) {
        throw new Error('supplierOrganization is required');
      }
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/supplier-organization.html',
        controller: SupplierOrganizationDialogCtrl,
        locals: {
          supplierOrganization: supplierOrganization,
        },
        // we might use resolve sometime..
        // resolve: {
        //   supplierOrganization: $q.resolve(supplierOrganization),
        // },
      });
      
    },
  };
  
});
