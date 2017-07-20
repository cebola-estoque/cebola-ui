angular.module('cebola.services')
.factory('uiAllocationDialog', function ($mdDialog, $q) {
  
  function EffectivateAllocationCtrl($scope, allocation) {
    $scope.allocation = allocation;
        
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    $scope.submit = function () {
      $mdDialog.hide($scope.quantityToEffectivate);
    };
  }
  
  return {
    effectivateEntry: function (allocation) {
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/allocation/effectivate-entry.html',
        controller: EffectivateAllocationCtrl,
        locals: {
          allocation: allocation
        },
      });
    },

    effectivateExit: function (allocation) {
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/allocation/effectivate-exit.html',
        controller: EffectivateAllocationCtrl,
        locals: {
          allocation: allocation
        },
      });
    },
    
    create: function (allocationTemplate) {
      
    },
    
    edit: function (allocationTemplate) {
      
    },
  };
  
});
