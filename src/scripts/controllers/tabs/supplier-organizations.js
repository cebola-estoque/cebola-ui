angular.module('cebola.controllers')
.controller('SupplierOrganizationsCtrl', function ($scope, $mdDialog, cebolaAPI, uiSupplierOrganizationDialog) {
  
  // initialize data objects
  $scope.supplierOrganizations = [];
  
  $scope.createSupplierOrganization = function () {
    
    return uiSupplierOrganizationDialog.create()
      .catch(function () {
        // cancelled
        console.log('cancelled')
      })
      .then(function (supplierOrganization) {
        return cebolaAPI.organization.create(supplierOrganization);
      })
      .then(function (supplierOrganization) {
        console.log('supplierOrganization created', supplierOrganization);
        $scope.supplierOrganizations.push(supplierOrganization);
      })
      .catch(function (err) {
        alert('error creating supplier organization');
        console.warn(err);
      });
  };
  
  $scope.editSupplierOrganization = function (sourceSupplierOrganization) {
    return uiSupplierOrganizationDialog.edit(sourceSupplierOrganization)
      .catch(function () {
        // cancelled
        console.log('cancelled');
      })
      .then(function (updatedSupplierOrganization) {
        return cebolaAPI.organization.update(
          sourceSupplierOrganization._id,
          updatedSupplierOrganization
        );
      })
      .then(function (supplierOrganization) {
        console.log('supplierOrganization updated', supplierOrganization);
      })
      .catch(function (err) {
        alert('error updating supplier organization');
        console.warn(err);
      });
  };
  
  $scope.deleteSupplierOrganization = function (supplierOrganization) {
    return $mdDialog.show(
      $mdDialog.confirm()
        .title('Deletar organização "' + supplierOrganization.name + '" ?')
        .ok('delete')
        .cancel('cancel')
    )
    .catch(function () {
      console.log('cancelled');
    })
    .then(function () {
      return cebolaAPI.organization.delete(supplierOrganization._id);
    })
    .then(function () {
      
      // remove from scope
      var index = $scope.supplierOrganizations.findIndex(function (o) {
        return o._id === supplierOrganization._id;
      });
      
      if (index !== -1) {
        $scope.supplierOrganizations.splice(index, 1);
      }
    })
    .catch(function (err) {
      alert('error deleting supplierOrganization');
      console.warn(err);
    });
  };
  
  $scope.listSupplierOrganizations = function () {
    return cebolaAPI.organization.list({
      roles: ['supplier']
    })
    .then(function (supplierOrganizations) {
      $scope.supplierOrganizations = supplierOrganizations;
    });
  };
  
  $scope.listSupplierOrganizations();
  
});
