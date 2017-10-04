angular.module('cebola.controllers')
.controller('EntryShipmentsCtrl', function ($scope, $q, $state, $timeout, cebolaAPI, entryShipmentActions, uiErrorDialog) {
  
  $scope.createEntryShipment = function () {

    return entryShipmentActions.create()
      .then(function (entryShipment) {

        entryShipment._highlight = true;

        $timeout(function () {
          entryShipment._highlight = false;
        }, 2000);
        
        $scope.entryShipments.push(entryShipment);
      })
      .catch(function (err) {
        if (!err) {
          // user canceled
          return;
        }

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao cadastrar nova entrada. Por favor tente novamente.',
        });

        throw err;
      });
  };
  
  $scope.listEntryShipments = function () {
    return cebolaAPI.shipment.listEntries().then(function (entryShipments) {
      $scope.entryShipments = entryShipments;
    })
    .catch(function (err) {
      uiErrorDialog.alert({
        textContent: 'Ocorreu um erro ao carregar dados das entradas. Por favor tente recarregar a página.',
      });

      throw err;
    });
  };
  
  $scope.editEntryShipment = function (sourceEntryShipment) {
    
    return entryShipmentActions.edit(sourceEntryShipment)
      .then(function (updatedEntryShipment) {
        var index = $scope.entryShipments.indexOf(sourceEntryShipment);

        updatedEntryShipment._highlight = true;

        $timeout(function () {
          updatedEntryShipment._highlight = false;
        }, 2000);

        $scope.entryShipments[index] = updatedEntryShipment;
      })
      .catch(function (err) {
        if (!err) {
          // user canceled
          return;
        }

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao editar dados da entrada. Por favor tente novamente.',
        });

        throw err;
      });
  };
  
  $scope.cancelEntryShipment = function (entryShipment) {
    return entryShipmentActions.cancel(entryShipment)
      .then(function () {
        return $scope.listEntryShipments();
      })
      .catch(function (err) {
        if (!err) {
          // user canceled
          return;
        }

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao cancelar a entrada. Por favor tente novamente.',
        });

        throw err;
      });
  };

  $scope.viewEntryShipmentDetails = function (entryShipment) {
    $state.go('entry-shipments.detail', {
      entryShipmentId: entryShipment._id,
      entryShipment: entryShipment,
    });
  };
  
  // filters
  $scope.isPendingEntryShipment = function (entryShipment, index, array) {
    return entryShipment.status &&
          (entryShipment.status.value === 'scheduled' ||
           entryShipment.status.value === 'in-progress');
  };
  $scope.isFinishedEntryShipment = function (entryShipment, index, array) {
    return entryShipment.status &&
          (entryShipment.status.value === 'finished' ||
           entryShipment.status.value === 'cancelled');
  };
  
  // initialize
  $scope.listEntryShipments();
});
