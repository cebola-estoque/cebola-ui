angular.module('cebola.controllers')
.controller('EntryShipmentsCtrl', function ($scope, uiDialogEntryShipment, cebolaAPI) {
  
  // initialize data
  $scope.entryShipments = [];
  
  $scope.createEntryShipment = function () {
    return uiDialogEntryShipment.create()
      .catch(function () {
        // user cancelled
        
      })
      .then(function (entryShipment) {
        console.log('create entryShipment', entryShipment);
        
        var supplier = entryShipment.supplier;
        var allocations = entryShipment.allocations;
        
        delete entryShipment.supplier;
        delete entryShipment.allocations;
        
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

  // initialize
  $scope.listEntryShipments();
  
});
