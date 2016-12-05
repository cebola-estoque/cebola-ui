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
    ebApiURI:
      window.CONFIG.ebApiURI.replace(TRAILING_SLASH_RE, ''),
  })
  
  .config(function ($stateProvider, $urlRouterProvider) {
    
    // urls are in pt-BR
    
    $stateProvider
      .state('inventory', {
        url: '/inventario',
        controller: 'InventoryCtrl',
        templateUrl: 'templates/tabs/inventory.html',
      })
      .state('entry-allocations', {
        url: '/entradas',
        controller: 'EntryAllocationsCtrl',
        templateUrl: 'templates/tabs/entry-allocations.html',
      })
      .state('exit-allocations', {
        url: '/saidas',
        controller: 'ExitAllocationsCtrl',
        templateUrl: 'templates/tabs/exit-allocations.html',
      })
      .state('products', {
        url: '/produtos',
        controller: 'ProductsCtrl',
        templateUrl: 'templates/tabs/products.html',
      })
      .state('supplier-organizations', {
        url: '/fornecedores',
        controller: 'SupplierOrganizationsCtrl',
        templateUrl: 'templates/tabs/supplier-organizations.html',
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
