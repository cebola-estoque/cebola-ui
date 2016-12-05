angular.module('cebola.controllers')
.controller('InventoryCtrl', function ($scope) {
  
  $scope.openMenu = function ($mdOpenMenu, ev) {
    $mdOpenMenu(ev);
  };
})