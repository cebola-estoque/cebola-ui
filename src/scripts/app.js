(function () {

  var TRAILING_SLASH_RE = /\/$/;

  angular.module('cebola', [
    'ui.router',
    'ngMaterial',
    'cebola.services',
    'cebola.controllers',
    'cebola.directives'
  ])

  /**
   * Configurations
   */
  .constant('CONFIG', {
    cebolaApiURI:
      window.CONFIG.cebolaApiURI.replace(TRAILING_SLASH_RE, ''),
  })
  
  .config(function ($stateProvider, $urlRouterProvider) {
    
    // urls are in pt-BR
    
    $stateProvider
      .state('inventory', {
        url: '/inventario',
        controller: 'InventoryCtrl',
        templateUrl: 'templates/tabs/inventory.html',
      })
      .state('entry-shipments', {
        url: '/entradas',
        controller: 'EntryShipmentsCtrl',
        templateUrl: 'templates/tabs/entry-shipments.html',
      })
      .state('entry-shipment-detail', {
        url: '/entrada/:entryShipmentId',
        controller: 'EntryShipmentDetailCtrl',
        templateUrl: 'templates/tabs/entry-shipment-detail.html',
        params: {
          entryShipment: null,
        }
      })
      .state('exit-shipments', {
        url: '/saidas',
        controller: 'ExitShipmentsCtrl',
        templateUrl: 'templates/tabs/exit-shipments.html',
      })
      .state('products', {
        url: '/produtos',
        controller: 'ProductModelsCtrl',
        templateUrl: 'templates/tabs/product-models.html',
      })
      .state('organizations', {
        url: '/organization/:role',
        controller: 'OrganizationsCtrl',
        templateUrl: 'templates/tabs/organizations.html',
      })
      .state('account', {
        url: '/minha-conta',
        controller: 'AccountCtrl',
        templateUrl: 'templates/tabs/account.html',
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/inventario');
  });
  
})();
