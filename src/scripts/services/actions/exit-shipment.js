angular.module('cebola.services')
.factory('exitShipmentActions', function ($q, uiDialogExitShipment, uiAnnotationDialog, cebolaAPI) {
  
  var exitShipmentActions = {};
  
  exitShipmentActions.create = function () {
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
      // .then(function (exitShipment) {
      //   console.log('shipment created ', exitShipment);
        
      //   $scope.exitShipments.push(exitShipment);
      // })
      // .catch(function (err) {
        
      //   if (!err) {
      //     // user cancelled
      //     return;
      //   }
        
      //   alert('there was an error creating the exit shipment');
      //   console.warn(err);
      // });
  };
  
  exitShipmentActions.edit = function (sourceExitShipment) {


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
      // .then(function (updatedExitShipment) {
      //   var index = $scope.exitShipments.indexOf(sourceExitShipment);

      //   $scope.exitShipments[index] = updatedExitShipment;
      // })
      // .catch(function (err) {
        
      //   if (!err) {
      //     // user cancelled
      //     return;
      //   }
        
      //   alert('there was an error creating the exit shipment');
      //   console.warn(err);
      // });

  };
  
  exitShipmentActions.cancel = function (shipment) {
    return uiAnnotationDialog.create({}, {
      title: 'Confirmar cancelamento',
      message: 'Uma saída cancelada não poderá mais ser editada. Confirma cancelamento?',
      ok: 'Confirmar cancelamento',
      cancel: 'Não cancelar',
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

    // return cebolaAPI.shipment.cancel(exitShipment._id)
    //   .then(function (cancelledEntryShipment) {
    //     console.log('exit shipment cancelled', cancelledEntryShipment);
    //     return $scope.listExitShipments();
    //   });
  };

  return exitShipmentActions;
});
