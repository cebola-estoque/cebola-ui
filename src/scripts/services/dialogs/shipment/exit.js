angular.module('cebola.services')
.factory('uiDialogExitShipment', function ($mdDialog, $q, cebolaAPI, util) {

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

      // set the _maxAllocatedQuantity property on each allocation
      allocation._maxAllocatedQuantity =
        allocation.product.inStock +
        allocation.product.allocatedForEntry +
        allocation.product.allocatedForExit +
        allocation.allocatedQuantity;
    });

    $scope.shipment = shipment;

    console.log($scope.shipment.allocations.active);

    window.test = $scope.shipment.allocations.active
    
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
      var allocationsDiff = util.array.diff(
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
    
    // TODO: cache availabilitySummary
    $scope.completeAvailableProducts = function (searchText) {
      return cebolaAPI.inventory.availabilitySummary(
        $scope.shipment.scheduledFor
      )
      .then(function (availableProductsSummary) {

        // map product summary data into objects that 
        // are suitable for the autocomplete
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

        /**
         * Prevent products already allocated in current
         * shipment to be reallocated.
         */
        availableProducts = availableProducts.filter(function (availableProduct) {
          return !$scope.shipment.allocations.active.some(function (allocation) {
            return allocation.product && util.product.isSame(allocation.product, availableProduct);
          });
        });
        
        // filter using searchText
        availableProducts = $filter('filter')(availableProducts, {
          model: {
            description: searchText
          }
        });

        // sort
        availableProducts = $filter('orderBy')(availableProducts, ['model.description','expiry']);

        console.log(availableProducts);

        return availableProducts;
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
