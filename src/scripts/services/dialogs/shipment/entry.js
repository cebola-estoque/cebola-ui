angular.module('cebola.services')
.factory('uiDialogEntryShipment', function ($mdDialog, $q, util) {

  /**
   * Shipment creation / edition Controller
   */
  function EntryShipmentDialog($scope, $filter, shipment, $mdDialog, cebolaAPI) {
    /**
     * Auxiliary scope values
     */
    $scope._supplierSearchText = '';
    $scope._productModelSearchText = '';
    
    // initialize data
    $scope.$isNew   = !shipment;
    $scope.shipment = shipment || {};
    
    // $scope.shipment.scheduledFor =
    //   $scope.shipment.scheduledFor ||
    //   moment().add(1, 'hour').startOf('hour').toDate();
    
    $scope.shipment.allocations = 
      $scope.shipment.allocations || {};
    $scope.shipment.allocations.active =
      $scope.shipment.allocations.active || [];

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
    var originalActiveAllocations = angular.copy(
      $scope.shipment.allocations.active);
  
    // start with at least one allocation in case the shipment is new
    if ($scope.$isNew) {
      $scope.shipment.allocations.active.push({});
    }
    
    $scope.submit = function () {
      
      var currentActiveAllocations = $scope.shipment.allocations.active.map(function (allocation) {
        // make copy in order not to modify original object
        allocation = Object.assign({}, allocation);
          
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
    $scope.shipment = angular.copy(shipment);

    // get the differences between allocation and effectivation
    $scope.allocatedAndEffectivatedDifferences = shipment.allocations.active.filter(function (allocation) {
      return allocation.effectivatedQuantity !== allocation.allocatedQuantity; 
    });

    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    $scope.submit = function () {

      var finishedShipment = angular.copy($scope.shipment);

      delete finishedShipment.allocations;
      delete finishedShipment.standaloneOperations;
      delete finishedShipment.scheduledFor;
      delete finishedShipment.supplier;

      $mdDialog.hide(finishedShipment);
    };
  }

  
  return {
    create: function (shipmentTemplate) {
      
      return $mdDialog.show({
        multiple: true,
        templateUrl: 'templates/dialogs/shipment/entry.html',
        controller: EntryShipmentDialog,
        locals: {
          shipment: shipmentTemplate
        },
      });
      
    },
    
    edit: function (sourceShipment) {
      
      return $mdDialog.show({
        multiple: true,
        templateUrl: 'templates/dialogs/shipment/entry.html',
        controller: EntryShipmentDialog,
        locals: {
          shipment: sourceShipment
        },
      });
      
    },

    finish: function (shipment) {
      return $mdDialog.show({
        multiple: true,
        templateUrl: 'templates/dialogs/shipment/finish-entry.html',
        controller: FinishEntryShipmentDialogCtrl,
        locals: {
          shipment: shipment
        },
      });
    },
  };
  
});
