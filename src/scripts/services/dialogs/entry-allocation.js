angular.module('cebola.services')
.factory('uiDialogEntryAllocation', function ($mdDialog) {
  
  return {
    create: function (entryAllocationTemplate) {
      
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/entry-allocation.html',
        controller: function () {
          
        },
      });
      
    },
    
    edit: function (entryAllocation) {
      
    },
  };
  
});
