angular.module('cebola.controllers')
.controller('ExitShipmentsCtrl', function ($scope, $q, $state, $timeout, exitShipmentActions, uiErrorDialog, cebolaAPI) {
  
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

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao cadastrar nova saída. Por favor tente novamente.',
        });

        throw err;
      });
  };
  
  $scope.listExitShipments = function () {
    return cebolaAPI.shipment.listExits().then(function (exitShipments) {
      $scope.exitShipments = exitShipments;
    })
    .catch(function (err) {
      uiErrorDialog.alert({
        textContent: 'Ocorreu um erro ao carregar dados das saídas. Por favor tente recarregar a página.',
      });

      throw err;
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

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao editar dados da saída. Por favor tente novamente.',
        });

        throw err;
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

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao cancelar a saída. Por favor tente novamente.',
        });

        throw err;
      });
  };

  $scope.viewExitShipmentDetails = function (exitShipment) {
    $state.go('exit-shipments.detail', {
      exitShipmentId: exitShipment._id,
      exitShipment: exitShipment,
    });
  };

  $scope.printExitShipmentReceipt = function (exitShipment) {
    $state.go('exit-shipments.detail.print-receipt', {
      exitShipmentId: exitShipment._id,
      exitShipment: exitShipment,
    });
  };

  $scope.printExitShipmentSummary = function (exitShipment) {
    $state.go('exit-shipments.detail.print-summary', {
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
