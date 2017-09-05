angular.module('cebola.controllers')
.controller('EntryShipmentsCtrl', function ($scope, $q, $state, cebolaAPI, entryShipmentActions) {
  
  // initialize data
  $scope.entryShipments = [];
  
  $scope.createEntryShipment = function () {

    return entryShipmentActions.create()
      .then(function (entryShipment) {
        $scope.entryShipments.push(entryShipment);
      })
      .catch(function (err) {
        
        if (!err) {
          // user canceled
          return;
        }
        
        alert('there was an error creating the entry shipment');
        console.warn(err);
      });
    // return uiDialogEntryShipment.create()
    //   .then(function (data) {
    //     var entryShipment = data.shipment;
    //     var supplier = data.shipment.supplier;
    //     var allocations = data.allocationsToCreate;
        
    //     delete entryShipment.supplier;
    //     // delete entryShipment.allocations;
        
    //     return cebolaAPI.shipment.scheduleEntry(
    //       supplier,
    //       entryShipment,
    //       allocations
    //     );
    //   })
    //   .then(function (entryShipment) {
    //     $scope.entryShipments.push(entryShipment);
    //   })
    //   .catch(function (err) {
        
    //     if (!err) {
    //       // user canceled
    //       return;
    //     }
        
    //     alert('there was an error creating the entry shipment');
    //     console.warn(err);
    //   });
  };
  
  $scope.listEntryShipments = function () {
    return cebolaAPI.shipment.listEntries().then(function (entryShipments) {
      $scope.entryShipments = entryShipments;
    });
  };
  
  $scope.editEntryShipment = function (sourceEntryShipment) {
    
    return entryShipmentActions.edit(sourceEntryShipment)
      .then(function (updatedEntryShipment) {
        var index = $scope.entryShipments.indexOf(sourceEntryShipment);

        $scope.entryShipments[index] = updatedEntryShipment;
      })
      .catch(function (err) {
        
        if (!err) {
          // user canceled
          return;
        }
        
        alert('there was an error creating the entry shipment');
        console.warn(err);
      });

    // return cebolaAPI.shipment.getById(sourceEntryShipment._id)
    //   .then(function (fullSourceEntryShipment) {
    //     return uiDialogEntryShipment.edit(fullSourceEntryShipment);
    //   })
    //   .then(function (data) {
    //     console.log('data', data);
        
    //     var promises = [];

    //     if (data.allocationsToCancel.length > 0) {
    //       promises.push(
    //         cebolaAPI.shipment.cancelAllocations(
    //           sourceEntryShipment._id,
    //           data.allocationsToCancel
    //         )
    //       );
    //     }

    //     if (data.allocationsToUpdate.length > 0) {
    //       promises.push(
    //         cebolaAPI.shipment.updateAllocations(
    //           sourceEntryShipment._id,
    //           data.allocationsToUpdate
    //         )
    //       );
    //     }
        
    //     if (data.allocationsToCreate.length > 0) {
    //       promises.push(
    //         cebolaAPI.shipment.createAllocations(
    //           sourceEntryShipment._id,
    //           data.allocationsToCreate
    //         )
    //       );
    //     }
        
    //     // first update allocations
    //     // and then update the shipment itself
    //     return $q.all(promises).then(function () {
    //       return cebolaAPI.shipment.update(
    //         sourceEntryShipment._id,
    //         data.shipment
    //       );
    //     });
    //   })
    //   .then(function (updatedEntryShipment) {
    //     var index = $scope.entryShipments.indexOf(sourceEntryShipment);

    //     $scope.entryShipments[index] = updatedEntryShipment;
    //   })
    //   .catch(function (err) {
        
    //     if (!err) {
    //       // user canceled
    //       return;
    //     }
        
    //     alert('there was an error creating the entry shipment');
    //     console.warn(err);
    //   });

  };
  
  $scope.cancelEntryShipment = function (entryShipment) {
    return entryShipmentActions.cancel(entryShipment)
      .then(function () {
        return $scope.listEntryShipments();
      })
      .catch(function (err) {
        if (!err) {
          return;
        }

        alert('houve um erro ao cancelar a carga');
        throw err;
      });

    // return cebolaAPI.shipment.cancel(entryShipment._id)
    //   .then(function (cancelledEntryShipment) {
    //     console.log('entry shipment cancelled', cancelledEntryShipment);
    //     return $scope.listEntryShipments();
    //   });
  };

  $scope.viewEntryShipmentDetails = function (entryShipment) {
    $state.go('entry-shipments.detail', {
      entryShipmentId: entryShipment._id,
      entryShipment: entryShipment,
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
  $scope.listEntryShipments();
  
});
