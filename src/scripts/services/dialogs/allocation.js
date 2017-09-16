angular.module('cebola.services')
.factory('uiAllocationDialog', function ($mdDialog, $q) {
  
  function EffectivateEntryAllocationDialogCtrl($scope, allocation) {
    $scope.allocation = allocation;
        
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.confirmAndPrint = function () {
      $mdDialog.hide({
        quantity: $scope.quantityToEffectivate,
        print: true,
      });
    }
    
    $scope.submit = function () {
      $mdDialog.hide({
        quantity: $scope.quantityToEffectivate,
      });
    };
  }

  function EffectivateExitAllocationDialogCtrl($scope, allocation) {
    $scope.allocation = allocation;
        
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    $scope.submit = function () {
      // TODO: normalize format as the entry allocation dialog
      $mdDialog.hide(-1 * $scope.quantityToEffectivate);
    };
  }
  
  return {
    effectivateEntry: function (allocation) {
      return $mdDialog.show({
        multiple: true,
        templateUrl: 'templates/dialogs/allocation/effectivate-entry.html',
        controller: EffectivateEntryAllocationDialogCtrl,
        locals: {
          allocation: allocation
        },
      });
    },

    effectivateExit: function (allocation) {
      return $mdDialog.show({
        multiple: true,
        templateUrl: 'templates/dialogs/allocation/effectivate-exit.html',
        controller: EffectivateExitAllocationDialogCtrl,
        locals: {
          allocation: allocation
        },
      });
    },
  };
  
});
