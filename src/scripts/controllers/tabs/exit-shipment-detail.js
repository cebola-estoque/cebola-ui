angular.module('cebola.controllers')
.controller('ExitShipmentDetailCtrl', function (
  $scope,
  $state,
  $stateParams,
  $mdDialog,
  cebolaAPI,
  uiAllocationDialog,
  uiDialogExitShipment,
  exitShipmentActions
) {
  
  $scope.loadShipment = function () {
    $scope.shipment = {};
    
    return cebolaAPI.shipment.getById($stateParams.exitShipmentId).then(function (shipment) {
      $scope.shipment = shipment;
    });
  };
  
  $scope.finishShipment = function (options) {

    options = options || {};

    return uiDialogExitShipment.finish($scope.shipment)
      .then(function (finishedShipment) {
        return cebolaAPI.shipment.update(
          $scope.shipment._id,
          finishedShipment
        );
      })
      .then(function (shipment) {
        return cebolaAPI.shipment.finish($scope.shipment._id);
      })
      .then(function (shipment) {
        return $scope.loadShipment();
      })
      .then(function (shipment) {
        if (options.print) {
          $state.go('exit-shipments.detail.print', {
            exitShipmentId: $scope.shipment._id,
            exitShipment: $scope.shipment,
          });
        }
      })
      .catch(function (err) {
        if (!err) {
          console.log('CANCELLED');
          return;
        }

        throw err;
      });
  };

  $scope.effectivateExitAllocation = function (allocation) {
    return uiAllocationDialog.effectivateExit(allocation)
    .catch(function () {
      // user cancelled
      throw new Error('CANCELLED');
    })
    .then(function (quantity) {
      console.log('effectivate: ', quantity);

      console.log('allocatedQuantity', allocation.allocatedQuantity)
      console.log('effectivatedQuantity', allocation.effectivatedQuantity)

      var toEffectivateQuantity = (allocation.allocatedQuantity - allocation.effectivatedQuantity);
      
      var effectivationExcess = -1 * (quantity - toEffectivateQuantity);
      
      console.log('effectivationExcess', effectivationExcess);

      if (effectivationExcess > 0) {
        $mdDialog.show(
          $mdDialog.alert()
            .title('Quantidade a ser efetivada excede quantidade alocada em ' + effectivationExcess + '. Não é possível realizar a operação.')
            .ok('Ok')
        );

        throw new Error('EffectivationExcess');
        
      } else {
        return quantity;
      }
    })
    .then(function (quantity) {
      return cebolaAPI.shipment.effectivateAllocation(
        allocation.shipment._id,
        allocation._id,
        quantity
      );
    })
    .then(function (operation) {
      // reload the shipment
      return $scope.loadShipment();
    })
    .catch(function (err) {
      if (err.cancelled) {
        console.warn('user cancelled');
      } else {
        // alert('error');
        console.warn(err);
      }
    });
  };

  $scope.editShipment = function () {
    return exitShipmentActions.edit($scope.shipment)
      .then(function (updatedShipment) {
        return $scope.loadShipment();
      })
      .catch(function (err) {
        
        if (!err) {
          // user canceled
          return;
        }
        
        alert('there was an error editing the exit shipment');
      });
  };


  $scope.cancelShipment = function () {
    return exitShipmentActions.cancel($scope.shipment)
      .then(function () {
        return $scope.loadShipment();
      })
      .catch(function (err) {
        if (!err) {
          return;
        }

        throw err;
      });
    
  };
  // initialize
  $scope.loadShipment();
})

.controller('ExitShipmentPrintCtrl', function (
  $scope,
  $stateParams,
  $filter,
  cebolaAPI
) {
  $scope.loadShipment = function () {
    $scope.shipment = {};
    
    return cebolaAPI.shipment.getById($stateParams.exitShipmentId).then(function (shipment) {
      $scope.shipment = shipment;

      var appTitle = [
        'Recibo',
        '#' + shipment.number,
        shipment.recipient.name,
        $filter('date')(shipment.scheduledFor, 'dd/MM/yyyy'),
      ].join(' ');

      $scope.setAppTitle(appTitle);

      /**
       * Compute totals
       */
      $scope.totalValue = shipment.allocations.finished.reduce(function (res, allocation) {
        var allocationValue = allocation.product.unitPrice.value * (-1 * allocation.effectivatedQuantity);
        return res + allocationValue
      }, 0);

      $scope.totalNetWeight = shipment.allocations.finished.reduce(function (res, allocation) {
        var allocationNetWeight = allocation.product.model.netWeight * (-1 * allocation.effectivatedQuantity);
        return res + allocationNetWeight
      }, 0);

      $scope.totalWeight = shipment.allocations.finished.reduce(function (res, allocation) {
        var allocationWeight = allocation.product.model.weight * (-1 * allocation.effectivatedQuantity);
        return res + allocationWeight
      }, 0);

      $scope.totalVolume = shipment.allocations.finished.reduce(function (res, allocation) {
        var modelVolume = (allocation.product.model.width / 100) * (allocation.product.model.height / 100) * (allocation.product.model.depth / 100);
        var allocationVolume = modelVolume * (-1 * allocation.effectivatedQuantity);
        return res + allocationVolume;
      }, 0);
    });
  };

  $scope.print = function () {
    window.print();
  };

  $scope.loadShipment();
});

