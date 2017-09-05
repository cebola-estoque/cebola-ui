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
    
    // initialize data
    if (!shipment || !shipment.status) {
      $scope.$isNew = true;
    }
    shipment = angular.copy(shipment) || {};
    
    shipment.scheduledFor =
      shipment.scheduledFor ||
      moment().add(1, 'hour').startOf('hour').toDate();
    
    shipment.allocations = 
      shipment.allocations || {};
    shipment.allocations.active =
      shipment.allocations.active || [];

    shipment.allocations.active.forEach(function (allocation) {
      // make the allocation allocatedQuantity positive
      allocation.allocatedQuantity = allocation.allocatedQuantity * -1;

      /**
       * Copy the original allocated quantity
       * for usage later;
       */
      allocation.originalAllocatedQuantity = allocation.allocatedQuantity;
    });

    $scope.shipment = shipment;

    /**
     * Ediatbility flag
     * 0: none
     * 1: restricted
     * 2: all
     */
    $scope._editability = 2;
    if ($scope.shipment.status) {
      if ($scope.shipment.status.value === 'in-progress' ||
          $scope.shipment.status.value === 'finished') {
        $scope._editability = 1;
      } else if ($scope.shipment.status.value === 'cancelled') {
        $scope._editability = 0;
      }
    }

    /**
     * Save a reference to the original allocations
     * so that we may compare to retrive updated ones
     */
    var originalActiveAllocations = angular.copy($scope.shipment.allocations.active);
  
    // start with at least one allocation
    if ($scope.$isNew) {
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

    $scope.enterLoadingState = function () {
      $scope.$loading = true;
    };

    $scope.exitLoadingState = function () {
      $scope.$loading = false;
    };

    $scope.updateAllocationAvailability = function () {
      // TODO: lock the UI
      $scope.enterLoadingState();

      return cebolaAPI.inventory.availabilitySummary($scope.shipment.scheduledFor)
        .then(function (availableProductsSummary) {
          // console.log('availableProductsSummary', availableProductsSummary);
          // console.log('active allocations', $scope.shipment.allocations.active);

          $scope.shipment.allocations.active.forEach(function (alloc) {

            if (!alloc || !alloc.product) {
              return;
            }

            // get the corresponding availability summary
            var availability = availableProductsSummary.find(function (summary) {
              return util.product.isSame(alloc.product, summary.product);
            });

            // update allocation availability info
            alloc.product.inStock = availability.inStock;
            alloc.product.allocatedForEntry = availability.allocatedForEntry;
            alloc.product.allocatedForExit = availability.allocatedForExit;

            var availableQuantity =
              availability.inStock +
              availability.allocatedForEntry +
              availability.allocatedForExit;

            // var currentlyAllocatedQuantity = alloc.allocatedQuantity || 0;

            // if (currentlyAllocatedQuantity > availableQuantity) {
            //   // overallocated
            //   if (availableQuantity > 0) {
            //     alloc.allocatedQuantity = availableQuantity;
            //   } else {
            //     alloc.allocatedQuantity = 0;
            //   }
            // }

            alloc._maxAllocatedQuantity =
              availability.inStock +
              availability.allocatedForEntry +
              availability.allocatedForExit +
              alloc.originalAllocatedQuantity;

            console.log('=====' + $scope.shipment.scheduledFor + '=====')
            console.log('availability.inStock', availability.inStock)
            console.log('availability.allocatedForEntry', availability.allocatedForEntry)
            console.log('availability.allocatedForExit', availability.allocatedForExit)
            console.log('alloc.allocatedQuantity', alloc.allocatedQuantity)
            console.log('alloc._maxAllocatedQuantity', alloc._maxAllocatedQuantity)
          });
        })
        .then(function () {
          $scope.exitLoadingState();
        })
        .catch(function (err) {
          $scope.exitLoadingState();
          alert('Houve um erro ao carregar informações de disponibilidade dos produtos. Por favor recarregue a página e tente novamente.')
        });
    };
    
    /**
     * Whenever the 'scheduledFor' property of the shipment is modified
     * we should verify if the allocations are still valid.
     */
    $scope.$watch('shipment.scheduledFor', function (newScheduledFor) {
      $scope.updateAllocationAvailability();
    });
    
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

        // console.log(availableProducts);

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

      return $mdDialog.show({
        templateUrl: 'templates/dialogs/shipment/exit.html',
        controller: ExitShipmentDialog,
        locals: {
          shipment: sourceShipment
        },
      });
    },

    finish: function (shipment) {
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/shipment/finish-exit.html',
        controller: FinishExitShipmentDialogCtrl,
        locals: {
          shipment: shipment
        },
      });
    },
  };
  
});
