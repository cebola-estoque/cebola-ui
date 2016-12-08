angular.module('cebola.services')
.factory('uiDialogEntryShipment', function ($mdDialog, $q) {
  
  
  function EntryShipmentDialog($scope, $mdDialog) {
    $scope.entryShipment = {
      
    };
    
    $scope.submit = function () {
      
    };
    
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.hide();
    }
  }
  
  return {
    create: function (entryShipmentTemplate) {
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/entry-shipment.html',
        controller: EntryShipmentDialog,
        resolve: {
          
        },
      });
      
    },
    
    edit: function (entryShipment) {
      
    },
  };
  
});
