angular.module('cebola.controllers')
.controller('EntryShipmentsCtrl', function ($scope, uiDialogEntryShipment) {
  
  $scope.openNewEntryShipment = function () {
    return uiDialogEntryShipment.create();
  };

  
});
