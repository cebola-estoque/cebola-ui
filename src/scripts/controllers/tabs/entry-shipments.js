angular.module('cebola.controllers')
.controller('EntryShipmentsCtrl', function ($scope, $q, uiDialogEntryShipment, cebolaAPI) {
  
  // initialize data
  $scope.entryShipments = [];
  
  $scope.createEntryShipment = function () {
    return uiDialogEntryShipment.create()
      .catch(function () {
        // user cancelled
      })
      .then(function (data) {
        console.log('create entryShipment', data);
        
        var entryShipment = data.entryShipment;
        var supplier = data.entryShipment.supplier;
        var allocations = data.allocationsToCreate;
        
        delete entryShipment.supplier;
        // delete entryShipment.allocations;
        
        return cebolaAPI.shipment.scheduleEntry(
          supplier,
          entryShipment,
          allocations
        );
      })
      .then(function (entryShipment) {
        console.log('entryShipment created ', entryShipment);
        
        $scope.entryShipments.push(entryShipment);
      })
      .catch(function (err) {
        alert('there was an error creating the entry shipment');
        console.warn(err);
      });
  };
  
  $scope.listEntryShipments = function () {
    return cebolaAPI.shipment.listEntries().then(function (entryShipments) {
      $scope.entryShipments = entryShipments;
    });
  };
  
  $scope.editEntryShipment = function (sourceEntryShipment) {
    
    return cebolaAPI.shipment.getById(sourceEntryShipment._id)
      .then(function (fullSourceEntryShipment) {
        return uiDialogEntryShipment.edit(fullSourceEntryShipment);
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
  $scope.pendingEntryShipments = function (entryShipment, index, array) {
    return entryShipment.status.value === 'scheduled';
  };
  $scope.finishedEntryShipments = function (entryShipment, index, array) {
    return entryShipment.status.value === 'finished' ||
           entryShipment.status.value === 'cancelled';
  };
  
  // initialize
  $scope.listEntryShipments();
  
});
