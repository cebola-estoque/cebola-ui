angular.module('cebola.services')
.factory('uiDialogEntryShipment', function ($mdDialog, $q, util) {

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

      // merge allocations that refer to the same product model
      // currentActiveAllocations = currentActiveAllocations.reduce(function )
      
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
        // 
        // DOES NOT MAKE SENSE, as a productModel may come in two measure units
        // or in two different expiry dates
        // 
        // /**
        //  * Prevent products models already allocated in current
        //  * shipment to be reallocated.
        //  */
        // productModels = productModels.filter(function (productModel) {
        //   return !$scope.shipment.allocations.active.some(function (allocation) {
        //     return allocation.product &&
        //            allocation.product.model &&
        //            util.product.isSameModel(
        //             allocation.product.model,
        //             productModel
        //            );
        //   });
        // });

        // filter using searchText
        productModels = $filter('filter')(productModels, {
          description: searchText,
        });

        // sort
        productModels = $filter('orderBy')(productModels, 'description');

        return productModels;
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