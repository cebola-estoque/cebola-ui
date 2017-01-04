angular.module('cebola.controllers')
.controller('ExitShipmentsCtrl', function ($scope, $q, uiDialogShipment, cebolaAPI) {
  
  // initialize data
  $scope.exitShipments = [];
  
  $scope.createExitShipment = function () {
    return uiDialogShipment.create('exit')
      .catch(function () {
        // user cancelled
      })
      .then(function (data) {
        console.log('create exit shipment', data);
        
        var shipment = data.shipment;
        var supplier = data.shipment.supplier;
        var allocations = data.allocationsToCreate;
        
        delete shipment.supplier;
        // delete shipment.allocations;
        
        return cebolaAPI.shipment.scheduleEntry(
          supplier,
          shipment,
          allocations
        );
      })
      .then(function (shipment) {
        console.log('shipment created ', shipment);
        
        $scope.exitShipments.push(shipment);
      })
      .catch(function (err) {
        alert('there was an error creating the entry shipment');
        console.warn(err);
      });
  };
  
  // $scope.listExitShipments = function () {
  //   return cebolaAPI.shipment.listExits().then(function (exitShipments) {
  //     $scope.exitShipments = exitShipments;
  //   });
  // };
  
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
  
  $scope.cancelEntryShipment = function (entryShipment) {
    return cebolaAPI.shipment.cancel(entryShipment._id)
      .then(function (cancelledEntryShipment) {
        console.log('entry shipment cancelled', cancelledEntryShipment);
      });
  };
  
  // filters
  $scope.isPendingEntryShipment = function (entryShipment, index, array) {
    return entryShipment.status.value === 'scheduled' ||
           entryShipment.status.value === 'in-progress';
  };
  $scope.isFinishedEntryShipment = function (entryShipment, index, array) {
    return entryShipment.status.value === 'finished' ||
           entryShipment.status.value === 'cancelled';
  };
  
  // initialize
  // $scope.listExitShipments();
  
});
