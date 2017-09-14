angular.module('cebola.services')
.factory('uiOrganizationDialog', function ($mdDialog, $q) {
  
  // TODO: unify organization dialogs
  
  function OrganizationDialogCtrl(organization, $scope, $mdDialog) {
    
    $scope.organization = organization || {};
    $scope.organization.roles =
      $scope.organization.roles || [];
    $scope.organization.addresses =
      $scope.organization.addresses || [{}];
    
    // title to be shown in the dialog
    $scope.dialogTitle = 'Nova organização';
    
    // role toggling
    $scope.toggleRole = function (role) {
      var idx = $scope.organization.roles.indexOf(role);
      
      if (idx === -1) {
        // add
        $scope.organization.roles.push(role);
      } else {
        // remove
        $scope.organization.roles.splice(idx, 1);
      }
    };
    
    $scope.hasRole = function (role) {
      return $scope.organization.roles.indexOf(role) !== -1;
    };
    
    $scope.addAddress = function () {
      $scope.organization.addresses.push({});
    };
    
    $scope.submit = function () {
      $mdDialog.hide($scope.organization);
    };
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    }
  }
  
  return {
    create: function (organizationTemplate) {
      
      return $mdDialog.show({
        multiple: true,
        templateUrl: 'templates/dialogs/organization.html',
        controller: OrganizationDialogCtrl,
        locals: {
          organization: organizationTemplate
        },
      });
      
    },
    
    edit: function (organization) {
      if (!organization) {
        throw new Error('organization is required');
      }
      
      return $mdDialog.show({
        multiple: true,
        templateUrl: 'templates/dialogs/organization.html',
        controller: OrganizationDialogCtrl,
        locals: {
          organization: organization,
        },
        // we might use resolve sometime..
        // resolve: {
        //   organization: $q.resolve(organization),
        // },
      });
      
    },
  };
  
});
