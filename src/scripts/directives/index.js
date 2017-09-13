angular.module('cebola.directives', [])

// .directive('cbMeasureUnitInput', function () {
//   const MEASURE_UNITS = [
//     {
//       label: 'KG',
//       value: 'KG'
//     },
//     {
//       label: 'L',
//       value: 'L',
//     },
//     {
//       label: 'PACOTE',
//       value: 'PACOTE',
//     },
//     {
//       label: 'CAIXA',
//       value: 'CAIXA'
//     },
//     {
//       label: 'UNIDADE',
//       value: 'UNIDADE',
//     }
//   ];

//   return {
//     restrict: 'E',
//     scope: {
//       model: '@model',
//     },
//     controller: function CbMeasureUnitInputCtrl($scope, $filter) {

//       $scope.completeMeasureUnits = function (searchText) {
//         return $filter('filter')(MEASURE_UNITS, {
//           label: searchText,
//         });
//       }
//     },
//     templateUrl: 'templates/directives/measure-unit-input.html',
//   };
// });

.directive('cbInventoryTable', function () {
  return {
    restrict: 'E',
    scope: {
      title: '@',
      data: '=',
      inventoryMethods: '=',
      enabledMenuItems: '@',
      rowClass: '@',
    },
    controller: function ($scope) {      
      $scope.isEntryAllocationRecord = function (record) {
        return record.kind === 'ProductAllocation' && record.type === 'entry';
      };
      
      $scope.isExitAllocationRecord = function (record) {
        return record.kind === 'ProductAllocation' && record.type === 'exit';
      };
    },
    templateUrl: 'templates/directives/inventory-table.html',
  }
});
