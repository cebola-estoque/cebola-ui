angular.module('cebola.controllers')
.controller('ExitShipmentsCtrl', function ($scope, $q, $state, $timeout, exitShipmentActions, uiDialogExitShipment, cebolaAPI) {
  
  $scope.createExitShipment = function () {
    return exitShipmentActions.create()
      .then(function (exitShipment) {
        console.log('shipment created ', exitShipment);
        
        exitShipment._highlight = true;

        $timeout(function () {
          exitShipment._highlight = false;
        }, 2000);
        
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

    return exitShipmentActions.edit(sourceExitShipment)
      .then(function (updatedExitShipment) {
        var index = $scope.exitShipments.indexOf(sourceExitShipment);

        updatedExitShipment._highlight = true;

        $timeout(function () {
          updatedExitShipment._highlight = false;
        }, 2000);

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
    return exitShipmentActions.cancel(exitShipment)
      .then(function (cancelledEntryShipment) {
        console.log('exit shipment cancelled', cancelledEntryShipment);
        return $scope.listExitShipments();
      })
      .catch(function (err) {
        
        if (!err) {
          // user cancelled
          return;
        }
        
        alert('there was an error cancelling the exit shipment');
        console.warn(err);
      });
  };

  $scope.viewExitShipmentDetails = function (exitShipment) {
    $state.go('exit-shipments.detail', {
      exitShipmentId: exitShipment._id,
      exitShipment: exitShipment,
    });
  };

  $scope.printExitShipmentReceipt = function (exitShipment) {
    $state.go('exit-shipments.detail.print', {
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
