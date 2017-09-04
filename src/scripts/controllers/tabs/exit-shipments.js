angular.module('cebola.controllers')
.controller('ExitShipmentsCtrl', function ($scope, $q, $state, uiDialogExitShipment, cebolaAPI) {
  
  // initialize data
  $scope.exitShipments = [];
  
  $scope.createExitShipment = function () {
    return uiDialogExitShipment.create()
      .then(function (data) {
        console.log('create exit shipment', data);
        
        var exitShipment = data.shipment;
        var recipient = data.shipment.recipient;
        var allocations = data.allocationsToCreate;
        
        delete exitShipment.recipient;
        delete exitShipment.allocations;
        
        return cebolaAPI.shipment.scheduleExit(
          recipient,
          exitShipment,
          allocations
        );
      })
      .then(function (exitShipment) {
        console.log('shipment created ', exitShipment);
        
        $scope.exitShipments.push(exitShipment);
      })
      .catch(function (err) {
        
        if (!err) {
          // user cancelled
          return;
        }
        
        alert('there was an error creating the exit shipment');
        console.warn(err);
      });
  };
  
  $scope.listExitShipments = function () {
    return cebolaAPI.shipment.listExits().then(function (exitShipments) {
      $scope.exitShipments = exitShipments;
    });
  };
  
  $scope.editExitShipment = function (sourceExitShipment) {


    return cebolaAPI.shipment.getById(sourceExitShipment._id)
      .then(function (fullSourceEntryShipment) {
        return uiDialogExitShipment.edit(fullSourceEntryShipment);
      })
      .then(function (data) {
        console.log('data', data);
        
        var promises = [];
        
        if (data.allocationsToCancel.length > 0) {
          promises.push(
            cebolaAPI.shipment.cancelAllocations(
              sourceExitShipment._id,
              data.allocationsToCancel
            )
          );
        }

        if (data.allocationsToUpdate.length > 0) {
          promises.push(
            cebolaAPI.shipment.updateAllocations(
              sourceExitShipment._id,
              data.allocationsToUpdate
            )
          );
        }
        
        if (data.allocationsToCreate.length > 0) {
          promises.push(
            cebolaAPI.shipment.createAllocations(
              sourceExitShipment._id,
              data.allocationsToCreate
            )
          );
        }
        
        // first update allocations
        // and then update the shipment itself
        return $q.all(promises).then(function () {
          return cebolaAPI.shipment.update(
            sourceExitShipment._id,
            data.shipment
          );
        });
      })
      .then(function (updatedExitShipment) {
        var index = $scope.exitShipments.indexOf(sourceExitShipment);

        $scope.exitShipments[index] = updatedExitShipment;
      })
      .catch(function (err) {
        
        if (!err) {
          // user cancelled
          return;
        }
        
        alert('there was an error creating the exit shipment');
        console.warn(err);
      });

  };
  
  $scope.cancelExitShipment = function (exitShipment) {
    return cebolaAPI.shipment.cancel(exitShipment._id)
      .then(function (cancelledEntryShipment) {
        console.log('exit shipment cancelled', cancelledEntryShipment);
        return $scope.listExitShipments();
      });
  };

  $scope.viewExitShipmentDetails = function (exitShipment) {
    $state.go('exit-shipments.detail', {
      exitShipmentId: exitShipment._id,
      exitShipment: exitShipment,
    });
  };
  
  // filters
  $scope.isPendingExitShipment = function (exitShipment, index, array) {
    return exitShipment.status.value === 'scheduled' ||
           exitShipment.status.value === 'in-progress';
  };
  $scope.isFinishedExitShipment = function (exitShipment, index, array) {
    return exitShipment.status.value === 'finished' ||
           exitShipment.status.value === 'cancelled';
  };
  
  // initialize
  $scope.listExitShipments();
  
});
