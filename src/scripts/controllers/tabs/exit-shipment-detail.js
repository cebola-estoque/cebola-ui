angular.module('cebola.controllers')
.controller('ExitShipmentDetailCtrl', function (
  $scope,
  $stateParams,
  $mdDialog,
  cebolaAPI,
  uiAllocationDialog,
  uiDialogExitShipment,
  exitShipmentActions
) {
  
  $scope.shipment = {};
  $scope.allocations = [];
  
  $scope.loadShipment = function () {
    return cebolaAPI.shipment.getById($stateParams.exitShipmentId).then(function (shipment) {
      $scope.shipment = shipment;
    });
  };
  
  $scope.finishShipment = function () {
    return uiDialogExitShipment.finish($scope.shipment)
      .then((finishedShipment) => {
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
    .then((quantity) => {
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
});
