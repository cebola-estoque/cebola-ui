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
  
  /**
   * Shipment creation / edition Controller
   */
  function EntryShipmentDialog($scope, $filter, shipmentType, shipment, $mdDialog, cebolaAPI) {
    /**
     * Auxiliary scope values
     */
    $scope._supplierSearchText = '';
    $scope._productModelSearchText = '';
    $scope._minScheduledFor = moment().toDate();
    
    // initialize data
    $scope.shipmentType = shipmentType;
    $scope.shipment = shipment || {};
    
    $scope.shipment.scheduledFor =
      $scope.shipment.scheduledFor ||
      moment($scope._minScheduledFor).add(1, 'hour').startOf('hour').toDate();
    
    $scope.shipment.allocations = 
      $scope.shipment.allocations || {};
    $scope.shipment.allocations.active =
      $scope.shipment.allocations.active || [];
    
    /**
     * Save a reference to the original allocations
     * so that we may compare to retrive updated ones
     */
    var originalActiveAllocations = angular.copy(
      $scope.shipment.allocations.active);
  
    // start with at least one allocation
    if ($scope.shipment.allocations.active.length === 0) {
      $scope.shipment.allocations.active.push({});
    }
    
    $scope.submit = function () {
      
      var currentActiveAllocations = $scope.shipment.allocations.active.map(function (allocation) {
        // make copy in order not to modify original object
        allocation = Object.assign({}, allocation);
        
        allocation.allocatedQuantity = shipmentType === 'entry' ?
          allocation.allocatedQuantity : -1 * allocation.allocatedQuantity;
          
        return allocation;
      });
      
      // compare all allocations
      // to the original ones to compute differences
      var allocationsDiff = arrayDiff(
        originalActiveAllocations,
        currentActiveAllocations,
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
        shipment: $scope.shipment,
        allocationsToCreate: allocationsDiff.create,
        allocationsToCancel: allocationsDiff.remove,
        allocationsToUpdate: allocationsDiff.update
      });
    };
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    /**
     * Shipment type specific behaviors
     */
    if (shipmentType === 'entry') {
      
    } else if (shipmentType === 'exit') {
      
      // $scope.$watch('shipment.scheduledFor')
      
      // TODO: improve
      if ($scope.shipment._id) {
        return cebolaAPI.inventory.availabilitySummary(
          $scope.shipment.scheduledFor
        )
        .then(function (availableProductsSummary) {
          if (!$scope.shipment.allocations) {
            return;
          }

          $scope.shipment.allocations.active.forEach(function (allocation) {
            var correspondingSummary = availableProductsSummary.find(function (productSummary) {
              return allocation.product.model._id === productSummary.product.model._id &&
                     allocation.product.expiry.getTime() === new Date(productSummary.product.expiry).getTime() &&
                     allocation.product.measureUnit === productSummary.product.measureUnit;
            });

            allocation.product.inStock = correspondingSummary.inStock;
            allocation.product.allocatedForEntry = correspondingSummary.allocatedForEntry;
            allocation.product.allocatedForExit = correspondingSummary.allocatedForExit;

            console.log(correspondingSummary);
          });
        });

      }

      
    }
    
    
    /**
     * Autocompletion methods
     */
    $scope.completeSuppliers = function (searchText) {
      return cebolaAPI.organization.list({
        roles: ['supplier']
      })
      .then(function (suppliers) {
        return $filter('filter')(suppliers, {
          name: searchText,
        });
      });
    };
    
    $scope.completeProductModels = function (searchText) {
      return cebolaAPI.productModel.list().then(function (productModels) {
        return $filter('filter')(productModels, {
          description: searchText,
        });
      });
    };
    
    /**
     * Allocations
     */
    $scope.createAllocation = function (allocationTemplate) {
      allocationTemplate = allocationTemplate || {};
      
      $scope.shipment.allocations.active.push(allocationTemplate);
    };
    
    $scope.cancelAllocation = function (allocation) {
      var idx = $scope.shipment.allocations.active.indexOf(allocation);
      
      if (idx !== -1) {
        $scope.shipment.allocations.active.splice(idx, 1);
      }
    };
  }

  /**
   * Shipment finishing controller
   */
  function FinishEntryShipmentDialogCtrl($scope, shipment) {

    console.log(shipment);
    $scope.shipment = shipment;

    // get the differences between allocation and effectivation
    $scope.allocatedAndEffectivatedDifferences = shipment.allocations.active.filter((allocation) => {
      return allocation.effectivatedQuantity !== allocation.allocatedQuantity; 
    });

    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    $scope.submit = function () {
      $mdDialog.hide($scope.annotations);
    };
  }

  
  return {
    create: function (shipmentType, shipmentTemplate) {
      
      if (!shipmentType) {
        throw new Error('shipmentType is required');
      }
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/shipment/entry.html',
        controller: EntryShipmentDialog,
        locals: {
          shipmentType: shipmentType,
          shipment: shipmentTemplate
        },
      });
      
    },
    
    edit: function (shipmentType, sourceShipment) {
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/shipment/entry.html',
        controller: EntryShipmentDialog,
        locals: {
          shipmentType: shipmentType,
          shipment: sourceShipment
        },
      });
      
    },

    finish: function (shipment) {
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/shipment/finish.html',
        controller: FinishEntryShipmentDialogCtrl,
        locals: {
          shipment: shipment
        },
      });
    },
  };
  
});
