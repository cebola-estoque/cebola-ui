angular.module('cebola.services')
.factory('uiDialogEntryShipment', function ($mdDialog, $q) {

  function arrayContains(container, item, identityFn) {
    return container.some((cItem) => {
      return identityFn(cItem, item);
    });
  }
  
  function arrayDiff(source, target, identityFn, trackProperties) {
    
    identityFn = identityFn || function (a, b) {
      return a === b;
    }
    
    var remove = source.filter(function (sItem) {
      return !arrayContains(target, sItem, identityFn);
    });
    
    var create = target.filter(function (tItem) {
      return !arrayContains(source, tItem, identityFn);
    });
    
    var update = target.filter(function (tItem) {
      return source.some(function (sItem) {
        
        return identityFn(sItem, tItem) && trackProperties.some(function (prop) {
          return objectPath.get(tItem, prop) !== objectPath.get(sItem, prop);
        });
        
      });
    });
    
    return {
      remove: remove,
      create: create,
      update: update,
    };
  }
  
  
  
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
      $scope.entryShipment.allocations || {};
    $scope.entryShipment.allocations.active =
      $scope.entryShipment.allocations.active || [];
    
    /**
     * Save a reference to the original allocations
     * so that we may compare to retrive updated ones
     */
    var originalActiveAllocations = angular.copy(
      $scope.entryShipment.allocations.active);
  
    // start with at least one allocation
    if ($scope.entryShipment.allocations.active.length === 0) {
      $scope.entryShipment.allocations.active.push({});
    }
    
    $scope.submit = function () {
      
      // compare all allocations
      // to the original ones to compute differences
      var allocationsDiff = arrayDiff(
        originalActiveAllocations,
        $scope.entryShipment.allocations.active,
        function isSameAllocation(a, b) {
          return a._id === b._id;
        },
        [
          'allocatedQuantity',
          'product.model._id',
          'product.model.description',
          'product.measureUnit',
          'product.expiry',
        ]
      );
      
      $mdDialog.hide({
        entryShipment: $scope.entryShipment,
        allocationsToCreate: allocationsDiff.create,
        allocationsToCancel: allocationsDiff.remove,
        allocationsToUpdate: allocationsDiff.update
      });
    };
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.hide();
    };
    
    /**
     * Autocompletion methods
     */
    $scope.searchSuppliers = function (searchText) {
      return cebolaAPI.organization.search(searchText, {
        roles: ['supplier']
      });
    };
    
    $scope.searchProductModels = function (searchText) {  
      return cebolaAPI.productModel.search(searchText);
    };
    
    /**
     * Allocations
     */
    $scope.createAllocation = function (allocationTemplate) {
      allocationTemplate = allocationTemplate || {};
      
      $scope.entryShipment.allocations.active.push(allocationTemplate);
    };
    
    $scope.cancelAllocation = function (allocation) {
      var idx = $scope.entryShipment.allocations.active.indexOf(allocation);
      
      if (idx !== -1) {
        $scope.entryShipment.allocations.active.splice(idx, 1);
      }
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
    
    edit: function (sourceEntryShipment) {
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/entry-shipment.html',
        controller: EntryShipmentDialog,
        locals: {
          entryShipment: sourceEntryShipment
        },
      });
      
    },
  };
  
});
