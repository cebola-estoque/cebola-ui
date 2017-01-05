angular.module('cebola.controllers')
.controller('OrganizationsCtrl', function ($scope, $stateParams, $mdDialog, cebolaAPI, uiOrganizationDialog) {
  
  var TAB_ROLE = $stateParams.role;
  
  // title to be shown in the ui
  $scope.tabTitle = TAB_ROLE === 'recipient' ? 'Receptores' : 'Fornecedores';
  
  // initialize data objects
  $scope.organizations = [];
  
  $scope.createOrganization = function () {
    
    return uiOrganizationDialog.create({
        roles: [TAB_ROLE]
      })
      .then(function (organization) {
        return cebolaAPI.organization.create(organization);
      })
      .then(function (organization) {
        console.log('organization created', organization);
        
        // add to the list if the organization has the role required
        var idx = organization.roles.indexOf(TAB_ROLE);
        
        if (idx !== -1) {
          $scope.organizations.push(organization);
        }
      })
      .catch(function (err) {
        
        if (!err) {
          // cancelled
          console.log('cancelled')
          return;
        }
        
        alert('error creating supplier organization');
        console.warn(err);
      });
  };
  
  $scope.editOrganization = function (sourceOrganization) {
    return uiOrganizationDialog.edit(sourceOrganization)
      .catch(function () {
        // cancelled
        console.log('cancelled');
      })
      .then(function (updatedOrganization) {
        return cebolaAPI.organization.update(
          sourceOrganization._id,
          updatedOrganization
        );
      })
      .then(function (organization) {
        console.log('organization updated', organization);
        
        // remove from list if the organization does not have the
        // required role anymore
        var roleIdx = organization.roles.indexOf(TAB_ROLE);
        
        if (roleIdx === -1) {
          // remove from scope
          var orgIdx = $scope.organizations.findIndex(function (o) {
            return o._id === organization._id;
          });
          
          if (orgIdx !== -1) {
            $scope.organizations.splice(orgIdx, 1);
          }
        }
        
      })
      .catch(function (err) {
        alert('error updating supplier organization');
        console.warn(err);
      });
  };
  
  $scope.deleteOrganization = function (organization) {
    return $mdDialog.show(
      $mdDialog.confirm()
        .title('Deletar organização "' + organization.name + '" ?')
        .ok('delete')
        .cancel('cancel')
    )
    .catch(function () {
      console.log('cancelled');
    })
    .then(function () {
      return cebolaAPI.organization.delete(organization._id);
    })
    .then(function () {
      
      // remove from scope
      var index = $scope.organizations.findIndex(function (o) {
        return o._id === organization._id;
      });
      
      if (index !== -1) {
        $scope.organizations.splice(index, 1);
      }
    })
    .catch(function (err) {
      alert('error deleting supplierOrganization');
      console.warn(err);
    });
  };
  
  $scope.listOrganizations = function () {
    return cebolaAPI.organization.list({
      roles: [TAB_ROLE]
    })
    .then(function (organizations) {
      $scope.organizations = organizations;
    });
  };
  
  $scope.listOrganizations();
  
  
});
