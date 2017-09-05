angular.module('cebola.services')
.factory('uiAnnotationDialog', function ($mdDialog, $q) {
  
  function CreateAnnotationDialogCtrl($scope, annotation, options) {
    $scope.annotation = annotation;
    $scope.dialogOptions = options;
        
    // dialog methods
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    $scope.submit = function () {
      $mdDialog.hide($scope.annotation);
    };
  }
  
  return {
    create: function (annotation, options) {
      return $mdDialog.show({
        templateUrl: 'templates/dialogs/annotation.html',
        controller: CreateAnnotationDialogCtrl,
        locals: {
          options: options,
          annotation: annotation
        },
      });
    },
  };
  
});
