angular.module('cebola.services')
.factory('uiDialogExitShipment', function ($mdDialog, $q, cebolaAPI) {

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
  function ExitShipmentDialog($scope, $filter, shipment, $mdDialog, cebolaAPI) {
    /**
     * Auxiliary scope values
     */
    $scope._supplierSearchText = '';
    $scope._productModelSearchText = '';
    $scope._minScheduledFor = moment().toDate();
    
    // initialize data
    shipment = angular.copy(shipment) || {};
    
    shipment.scheduledFor =
      shipment.scheduledFor ||
      moment($scope._minScheduledFor).add(1, 'hour').startOf('hour').toDate();
    
    shipment.allocations = 
      shipment.allocations || {};
    shipment.allocations.active =
      shipment.allocations.active || [];

    shipment.allocations.active.forEach(function (allocation) {
      // make the allocation allocatedQuantity positive
      allocation.allocatedQuantity = allocation.allocatedQuantity * -1;
    });

    $scope.shipment = shipment;

    console.log($scope.shipment.allocations.active);
    
    /**
     * Save a reference to the original allocations
     * so that we may compare to retrive updated ones
     */
    var originalActiveAllocations = angular.copy($scope.shipment.allocations.active);
  
    // start with at least one allocation
    if ($scope.shipment.allocations.active.length === 0) {
      $scope.shipment.allocations.active.push({});
    }
    
    $scope.submit = function () {
      
      var currentActiveAllocations = $scope.shipment.allocations.active.map(function (allocation) {
        // make copy in order not to modify original object
        allocation = Object.assign({}, allocation);
        
        allocation.allocatedQuantity = -1 * allocation.allocatedQuantity;
          
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
    
    // TODO: when the scheduledFor changes, we should update
    // products...
    // $scope.$watch('shipment.scheduledFor')
      

    
    
    /**
     * Autocompletion methods
     */
    $scope.completeRecipients = function (searchText) {
      return cebolaAPI.organization.list({
        roles: ['recipient']
      })
      .then(function (recipients) {
        return $filter('filter')(recipients, {
          name: searchText,
        });
      });
    };
    
    $scope.completeAvailableProducts = function (searchText) {
      return cebolaAPI.inventory.availabilitySummary(
        $scope.shipment.scheduledFor
      )
      .then(function (availableProductsSummary) {
        var availableProducts = availableProductsSummary.map(function (productSummary) {
          return {
            model: productSummary.product.model,
            measureUnit: productSummary.product.measureUnit,
            expiry: new Date(productSummary.product.expiry),
            
            inStock: productSummary.inStock,
            allocatedForEntry: productSummary.allocatedForEntry,
            allocatedForExit: productSummary.allocatedForExit,
          };
        });
        
        // console.log(availableProducts[0].model.description);
        
        console.log(searchText);
        
        console.log($filter('filter')(availableProducts, {
          model: {
            description: searchText
          }
        }))
        
        return $filter('filter')(availableProducts, {
          model: {
            description: searchText
          }
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

      if ($scope.shipment.allocations.active.length === 0) {
        $scope.createAllocation();
      }
    };
  }
  
  /**
   * Shipment finishing controller
   */
  function FinishExitShipmentDialogCtrl($scope, shipment) {

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
    create: function (shipmentTemplate) {
      shipmentTemplate = shipmentTemplate || {};

      return $mdDialog.show({
        templateUrl: 'templates/dialogs/shipment/exit.html',
        controller: ExitShipmentDialog,
        locals: {
          shipment: shipmentTemplate
        },
      });
    },
    
    edit: function (sourceShipment) {
      if (!sourceShipment) {
        throw new Error('sourceShipment is required');
      }

      var shipmentLoadPromise;

      // TODO: improve
      if (sourceShipment._id) {
        shipmentLoadPromise = cebolaAPI.inventory.availabilitySummary(
          sourceShipment.scheduledFor
        )
        .then(function (availableProductsSummary) {
          if (!sourceShipment.allocations) {
            return sourceShipment;
          }

          sourceShipment.allocations.active.forEach(function (allocation) {
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

          return sourceShipment;
        });
      } else {
        shipmentLoadPromise = $q.resolve(sourceShipment);
      }


      return shipmentLoadPromise.then(function (shipment) {
        return $mdDialog.show({
          templateUrl: 'templates/dialogs/shipment/exit.html',
          controller: ExitShipmentDialog,
          locals: {
            shipment: shipment
          },
        });
      });
        
    },

    finish: function (shipment) {
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/shipment/finish.html',
        controller: FinishExitShipmentDialogCtrl,
        locals: {
          shipment: shipment
        },
      });
    },
  };
  
});
