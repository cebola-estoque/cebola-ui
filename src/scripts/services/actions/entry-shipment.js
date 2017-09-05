angular.module('cebola.services')
.factory('entryShipmentActions', function ($q, $state, uiDialogEntryShipment, uiAnnotationDialog, cebolaAPI) {
  
  var entryShipmentActions = {};

  entryShipmentActions.create = function () {
    return uiDialogEntryShipment.create()
      .then(function (data) {
        var entryShipment = data.shipment;
        var supplier = data.shipment.supplier;
        var allocations = data.allocationsToCreate;
        
        delete entryShipment.supplier;
        // delete entryShipment.allocations;
        
        return cebolaAPI.shipment.scheduleEntry(
          supplier,
          entryShipment,
          allocations
        );
      })
      // .then(function (entryShipment) {
      //   $scope.entryShipments.push(entryShipment);
      // })
      .catch(function (err) {
        
        if (!err) {
          // user canceled
          return;
        }
        
        alert('there was an error creating the entry shipment');
        console.warn(err);
      });
  };
  
  entryShipmentActions.edit = function (sourceEntryShipment) {
    
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
        
        // first update allocations
        // and then update the shipment itself
        return $q.all(promises).then(function () {
          return cebolaAPI.shipment.update(
            sourceEntryShipment._id,
            data.shipment
          );
        });
      })
      // .then(function (updatedEntryShipment) {
      //   var index = $scope.entryShipments.indexOf(sourceEntryShipment);

      //   $scope.entryShipments[index] = updatedEntryShipment;
      // })
      // .catch(function (err) {
        
      //   if (!err) {
      //     // user canceled
      //     return;
      //   }
        
      //   alert('there was an error creating the entry shipment');
      //   console.warn(err);
      // });

  };

  entryShipmentActions.cancel = function (shipment) {
    return uiAnnotationDialog.create({}, {
      title: 'Confirmar cancelamento',
      message: 'Uma entrada cancelada não poderá mais ser editada. Confirma cancelamento?',
      ok: 'Confirmar cancelamento',
      cancel: 'Cancelar',
      required: true,
    })
    .then(function (annotation) {
      return cebolaAPI.shipment.update(shipment._id, {
        // TODO
        annotations: annotation.body
      });
    })
    .then(function () {
      return cebolaAPI.shipment.cancel(shipment._id);
    });

    // return $mdDialog.show(
    //   $mdDialog.confirm()
    //     .title('Uma entrada cancelada não poderá mais ser editada. Confirma cancelamento?')
    //     .ok('Cancelar entrada')
    //     .cancel('cancelar')
    // )
    // .then(function () {
    //   return cebolaAPI.shipment.cancel(shipment._id);
    // });
  };
  

  return entryShipmentActions;
});
