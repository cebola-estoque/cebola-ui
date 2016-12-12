angular.module('cebola.services')
.factory('uiDialogEntryShipment', function ($mdDialog, $q) {
  
  function EntryShipmentDialog($scope, entryShipment, $mdDialog, cebolaAPI) {
    /**
     * Auxiliary scope values
     */
    $scope._supplierSearchText = '';
    $scope._productModelSearchText = '';
    $scope._minScheduledFor = moment().toDate();
    
    // initialize data
    $scope.entryShipment = entryShipment || {};
    
    $scope.entryShipment.scheduledFor =
      $scope.entryShipment.scheduledFor ||
      moment($scope._minScheduledFor).add(1, 'hour').startOf('hour').toDate();
    
    $scope.entryShipment.allocations = 
      ($scope.entryShipment.allocations && $scope.entryShipment.allocations.length > 0) ? $scope.entryShipment.allocations : [{}];
    
    $scope.submit = function () {
      $mdDialog.hide($scope.entryShipment);
    };
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.hide();
    };
    
    $scope.searchSuppliers = function (searchText) {
      return cebolaAPI.organization.search(searchText, {
        roles: ['supplier']
      });
    };
    
    /**
     * Allocations
     */
    $scope.addAllocation = function (allocationTemplate) {
      allocationTemplate = allocationTemplate || {};
      
      $scope.entryShipment.allocations.push(allocationTemplate);
    };
    $scope.searchProductModels = function (searchText) {  
      return cebolaAPI.productModel.search(searchText);
    };
  }
  
  return {
    create: function (entryShipmentTemplate) {
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/entry-shipment.html',
        controller: EntryShipmentDialog,
        locals: {
          entryShipment: entryShipmentTemplate
        },
      });
      
    },
    
    edit: function (entryShipment) {
      
    },
  };
  
});
