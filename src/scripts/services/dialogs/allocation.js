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
    effectivate: function (allocation) {
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/allocation/effectivate.html',
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
