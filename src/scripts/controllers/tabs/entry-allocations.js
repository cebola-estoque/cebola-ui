angular.module('cebola.controllers')
.controller('EntryAllocationsCtrl', function ($scope, uiDialogEntryAllocation) {
  
  $scope.openNewEntryAllocation = function () {
    return uiDialogEntryAllocation.create();
  };

  
});
