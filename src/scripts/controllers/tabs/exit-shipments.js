angular.module('cebola.controllers')
.controller('ExitShipmentsCtrl', function ($scope, $q, uiDialogShipment, cebolaAPI) {
  
  // initialize data
  $scope.exitShipments = [];
  
  $scope.createExitShipment = function () {
    return uiDialogShipment.create('exit')
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
  
  $scope.editExitShipment = function (sourceEntryShipment) {
    
    return cebolaAPI.shipment.getById(sourceEntryShipment._id)
      .then(function (fullSourceEntryShipment) {
        return uiDialogShipment.edit(fullSourceEntryShipment);
      })
      .then(function (data) {
        console.log('data', data);
        
        var promises = [];
        
        if (data.allocationsToCancel.length > 0) {
          promises.push(
            cebolaAPI.shipment.cancelAllocations(
              sourceEntryShipment._id,
              data.allocationsToCancel
            )
          );
        }

        if (data.allocationsToUpdate.length > 0) {
          promises.push(
            cebolaAPI.shipment.updateAllocations(
              sourceEntryShipment._id,
              data.allocationsToUpdate
            )
          );
        }
        
        if (data.allocationsToCreate.length > 0) {
          promises.push(
            cebolaAPI.shipment.createAllocations(
              sourceEntryShipment._id,
              data.allocationsToCreate
            )
          );
        }
        
        return $q.all(promises);
        
      })
      .then(function () {
        console.log('updated');
      });

  };
  
  $scope.cancelEntryShipment = function (exitShipment) {
    return cebolaAPI.shipment.cancel(exitShipment._id)
      .then(function (cancelledEntryShipment) {
        console.log('entry shipment cancelled', cancelledEntryShipment);
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
