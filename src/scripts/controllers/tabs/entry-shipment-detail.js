angular.module('cebola.controllers')
.controller('EntryShipmentDetailCtrl', function (
  $scope,
  $stateParams,
  $state,
  $mdDialog,
  cebolaAPI,
  uiAllocationDialog,
  uiOperationDialog,
  uiDialogEntryShipment,
  uiErrorDialog,
  entryShipmentActions
) {
  
  $scope.loadShipment = function () {
    return cebolaAPI.shipment.getById($stateParams.entryShipmentId).then(function (shipment) {
      $scope.shipment = shipment;
    })
    .catch(function (err) {
      uiErrorDialog.alert({
        textContent: 'Ocorreu um erro ao carregar dados da entrada. Por favor tente recarregar a página.',
      });

      throw err;
    });
  };
  
  $scope.finishShipment = function () {
    return uiDialogEntryShipment.finish($scope.shipment)
      .then(function (finishedShipment) {
        return cebolaAPI.shipment.update(
          $scope.shipment._id,
          finishedShipment
        );
      })
      .then(function (shipment) {
        return cebolaAPI.shipment.finish($scope.shipment._id);
      })
      .then(function (shipment) {
        return $scope.loadShipment();
      })
      .catch(function (err) {
        if (!err) {
          console.log('CANCELLED');
          return;
        }

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao finalizar a entrada. Por favor tente novamente.',
        });

        throw err;
      });
  };
  
  $scope.effectivateEntryAllocation = function (allocation) {

    var _shouldPrint = false;

    return uiAllocationDialog.effectivateEntry(allocation).then(function (data) {
      console.log('effectivate: ', data.quantity);

      _shouldPrint = data.print;
      
      var effectivationExcess = data.quantity - (allocation.allocatedQuantity - allocation.effectivatedQuantity);
      
      if (effectivationExcess > 0) {
        
        return $mdDialog.show(
          $mdDialog.confirm()
            .title('Quantidade a ser efetivada excede quantidade alocada em ' + effectivationExcess + '. Confirma efetivação?')
            .ok('efetivar')
            .cancel('cancelar')
        )
        .then(function () {
          return data;
        });
        
      } else {
        return data;
      }
    })
    .then(function (data) {
      return cebolaAPI.shipment.effectivateAllocation(
        allocation.shipment._id,
        allocation._id,
        data.quantity
      );
    })
    .then(function (operation) {
      // reload the shipment
      return $scope.loadShipment().then(function () {
        if (_shouldPrint) {
          return $state.go('entry-shipments.detail.print-operation', {
            entryShipment: $scope.shipment,
            entryShipmentId: $scope.shipment._id,
            entryOperation: operation,
            operationId: operation._id,
          });
        }
      });
    })
    .catch(function (err) {
      if (!err) {
        console.warn('user cancelled');
        return;
      }

      uiErrorDialog.alert({
        textContent: 'Ocorreu um erro ao efetivar a entrada. Por favor tente novamente.',
      });

      throw err;
    });
  };

  $scope.createStandaloneOperation = function () {
    return uiOperationDialog.createStandalone({})
      .then(function (operation) {
        return cebolaAPI.shipment.createOperations($scope.shipment._id, [operation]);
        // console.log(operation);
      })
      .then(function (createdOperation) {
        console.log('created operation');
        return $scope.loadShipment();
      })
      .catch(function (err) {
        if (!err) {
          return;
        }

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao cadastrar operação de entrada de produto não previsto. Por favor tente novamente.',
        });

        throw err;
      })
  };

  $scope.cancelShipment = function () {

    return entryShipmentActions.cancel($scope.shipment)
      .then(function () {
        return $scope.loadShipment();
      })
      .catch(function (err) {
        if (!err) {
          return;
        }

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao cancelar a entrada. Por favor tente novamente.',
        });

        throw err;
      });
    
  };

  $scope.editShipment = function () {
    return entryShipmentActions.edit($scope.shipment)
      .then(function (updatedEntryShipment) {
        return $scope.loadShipment();
      })
      .catch(function (err) {
        if (!err) {
          // user canceled
          return;
        }

        uiErrorDialog.alert({
          textContent: 'Ocorreu um erro ao editar os dados da entrada. Por favor tente novamente.',
        });

        throw err;
      });
  };
  
  // initialize
  $scope.loadShipment();
})

.controller('EntryShipmentPrintCtrl', function (
  $scope,
  $stateParams,
  $rootScope,
  cebolaAPI,
  uiAllocationDialog,
  uiOperationDialog,
  uiDialogEntryShipment,
  entryShipmentActions
) {
  
  $scope.loadShipment = function () {
    $scope.shipment = {};
    
    return cebolaAPI.shipment.getById($stateParams.entryShipmentId).then(function (shipment) {
      $scope.shipment = shipment;
    });
  };

  $scope.loadShipment();
})

.controller('EntryShipmentOperationPrintCtrl', function (
  $scope,
  $stateParams,
  uiErrorDialog,
  cebolaAPI
) {
  $scope.loadShipment = function () {
    $scope.shipment = {};
    
    return cebolaAPI.shipment.getById($stateParams.entryShipmentId).then(function (shipment) {
      $scope.shipment = shipment;

      var shipmentActiveAllocations = shipment.allocations && shipment.allocations.active ?
        shipment.allocations.active : [];

      var shipmentFinishedAllocations = shipment.allocations && shipment.allocations.finished ?
        shipment.allocations.finished : [];

      var shipmentActiveOperations = shipmentActiveAllocations
        .concat(shipmentFinishedAllocations)
        .reduce(function (acc, alloc) {
          return acc.concat(alloc.operations.active);
        }, []);

      if (shipment.standaloneOperations && shipment.standaloneOperations.active) {
        shipmentActiveOperations = shipmentActiveOperations.concat(shipment.standaloneOperations.active);
      }

      $scope.operation = shipmentActiveOperations.find(function (op) {
        return op._id === $stateParams.operationId;
      });
    })
    .catch(function (err) {
      uiErrorDialog.alert({
        textContent: 'Ocorreu um erro ao carregar dados da operação. Por favor tente recarregar a página.',
      });

      throw err;
    });
  };
  
  $scope.print = function () {
    window.print();
  };

  $scope.loadShipment();
});
