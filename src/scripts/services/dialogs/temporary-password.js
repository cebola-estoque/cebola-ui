angular.module('cebola.services')
.factory('uiTemporaryPasswordDialog', function ($mdDialog, $q) {
  
  function PromprTemporaryPasswordDialog($scope) {
    
    $scope.submit = function () {
      $mdDialog.hide($scope.password);
    };
  }
  
  return {
    prompt: function () {
      return $mdDialog.show({
        multiple: true,
        escapeToClose: false,
        templateUrl: 'templates/dialogs/temporary-password.html',
        controller: PromprTemporaryPasswordDialog,
      });
    },
  };
  
});
