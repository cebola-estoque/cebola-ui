(function () {

  var TRAILING_SLASH_RE = /\/$/;

  angular.module('cebola', [
    'ngRaven',
    'ui.router',
    'ngMaterial',
    'ngMessages',
    'ngAnimate',

    // third-party
    'pascalprecht.translate',
    'ngFileUpload',
    
    'cebola.services',
    'cebola.controllers',
    'cebola.directives',
  ])

  /**
   * Configurations
   */
  .constant('CONFIG', {
    cebolaApiURI:
      window.CONFIG.cebolaApiURI.replace(TRAILING_SLASH_RE, ''),
    accountApiURI:
      window.CONFIG.accountApiURI.replace(TRAILING_SLASH_RE, ''),
    cacheBustVersion:
      window.CONFIG.cacheBustVersion,
    DEFAULT_MEASURE_UNITS: [
      'KG',
      'L',
      'PACOTE',
      'CAIXA',
      'UNIDADE',
    ],
    DEFAULT_PRODUCT_MODEL_CATEGORIES: [
    
    ],
  })

  .config(function ($stateProvider, $urlRouterProvider, $translateProvider) {
    
    /**
     * Configure routing.
     * URLs are in pt-BR
     */
    $stateProvider
      /**
       * Inventory routes
       */
      .state('inventory', {
        url: '/inventario',
        views: {
          'body@': {
            controller: 'InventoryCtrl',
            templateUrl: 'templates/tabs/inventory.html',
          }
        },
        appTitle: 'Cebola - Inventário',
      })
      .state('inventory.detail', {
        url: '/:productModelId',
        views: {
          'body@': {
            controller: 'InventoryDetailCtrl',
            templateUrl: 'templates/tabs/inventory-detail.html',
          }
        }
      })

      /**
       * Entry shipment routes
       */
      .state('entry-shipments', {
        url: '/entradas',
        views: {
          'body@': {
            controller: 'EntryShipmentsCtrl',
            templateUrl: 'templates/tabs/entry-shipments.html',
          }
        }
      })
      .state('entry-shipments.detail', {
        url: '/:entryShipmentId',
        views: {
          'body@': {
            controller: 'EntryShipmentDetailCtrl',
            templateUrl: 'templates/tabs/entry-shipment-detail.html',
          }
        },
        params: {
          entryShipment: null,
        }
      })
      .state('entry-shipments.detail.print', {
        url: '/imprimir',
        views: {
          'body@': {
            controller: 'EntryShipmentPrintCtrl',
            templateUrl: 'templates/print/shipment.html',
          }
        },
        params: {
          entryShipment: null,
        },
        bodyClasses: 'print-mode',
      })
      .state('entry-shipments.detail.print-operation', {
        url: '/operacoes/:operationId',
        views: {
          'body@': {
            controller: 'EntryShipmentOperationPrintCtrl',
            templateUrl: 'templates/print/entry-operation.html',
          }
        },
        params: {
          entryShipment: null,
          entryOperation: null,
        },
        bodyClasses: 'print-mode',
      })

      /**
       * Exit shiptment routes
       */
      .state('exit-shipments', {
        url: '/saidas',
        views: {
          'body@': {
            controller: 'ExitShipmentsCtrl',
            templateUrl: 'templates/tabs/exit-shipments.html',
          }
        }
      })
      .state('exit-shipments.detail', {
        url: '/:exitShipmentId',
        views: {
          'body@': {
            controller: 'ExitShipmentDetailCtrl',
            templateUrl: 'templates/tabs/exit-shipment-detail.html',
          }
        }
      })
      .state('exit-shipments.detail.print-summary', {
        url: '/imprimir/resumo',
        views: {
          'body@': {
            controller: 'ExitShipmentPrintSummaryCtrl',
            templateUrl: 'templates/print/exit-shipment-summary.html',
          }
        },
        params: {
          exitShipment: null,
        },
        bodyClasses: 'print-mode',
      })
      .state('exit-shipments.detail.print-receipt', {
        url: '/imprimir/recibo',
        views: {
          'body@': {
            controller: 'ExitShipmentPrintReceiptCtrl',
            templateUrl: 'templates/print/exit-shipment-receipt.html',
          }
        },
        params: {
          exitShipment: null,
        },
        bodyClasses: 'print-mode',
      })

      /**
       * Operations routes
       */
      .state('operations', {
        url: '/operacoes',
        views: {
          'body@': {
            controller: 'OperationsCtrl',
            templateUrl: 'templates/tabs/operations.html',
          }
        }
      })

      /**
       * Product model routes
       */
      .state('products', {
        url: '/produtos',
        views: {
          'body@': {
            controller: 'ProductModelsCtrl',
            templateUrl: 'templates/tabs/product-models.html',
          }
        }
      })

      /**
       * Organization routes
       */
      .state('organizations', {
        url: '/organization/:role',
        views: {
          'body@': {
            controller: 'OrganizationsCtrl',
            templateUrl: 'templates/tabs/organizations.html',
          }
        }
      })

      /**
       * Account routes
       */
      .state('account', {
        url: '/minha-conta',
        controller: 'AccountCtrl',
        templateUrl: 'templates/tabs/account.html',
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/inventario');

    /**
     * Configure translations
     */
    $translateProvider.translations('pt-BR', {
      scheduled: 'agendada',
      'in-progress': 'em progresso',
      finished: 'finalizada',
      cancelled: 'cancelada',
    });
    $translateProvider.preferredLanguage('pt-BR');
  })

  // http interceptor that shows loading indicator on ajax request
  .config(function($httpProvider, CONFIG) {
    // alternatively, register the interceptor via an anonymous factory
    $httpProvider.interceptors.push(function($q, $rootScope) {

      var HTTP_PENDING_REQUEST_COUNT = 0;

      function incrementHttpPendingCount() {
        ++HTTP_PENDING_REQUEST_COUNT;
      }

      function decrementHttpPendingCount() {
        --HTTP_PENDING_REQUEST_COUNT;
      }

      function isLoading() {
        return HTTP_PENDING_REQUEST_COUNT > 0;
      }

      function isUIResource(url) {
        return /^templates/.test(url);
      }

      return {
        request: function(config) {

          incrementHttpPendingCount();

          if (config.method === 'GET') {
            if (isUIResource(config.url)) {
              config.params = config.params || {}
              config.params.cacheVersionBust = CONFIG.cacheBustVersion
            }
          }

          $rootScope.$httpGlobalLoading = true;

          return config;
        },

        // optional method
        requestError: function(rejection) {

          decrementHttpPendingCount();
          $rootScope.$httpGlobalLoading = isLoading();

          return $q.reject(rejection);
        },

        response: function(response) {

          decrementHttpPendingCount();
          $rootScope.$httpGlobalLoading = isLoading();

          // same as above
          return response;
        },

        // optional method
        responseError: function(rejection) {

          decrementHttpPendingCount();
          $rootScope.$httpGlobalLoading = isLoading();

          return $q.reject(rejection);
        }
      };
    });
  })
  
  /**
   * Outmost controller of the application
   */
  .controller('AppCtrl', function ($scope, $rootScope, $state, $mdDialog, CONFIG, accountAPI) {

    /**
     * Expose config
     */
    $rootScope.CONFIG = CONFIG;

    /**
     * GO BACK functionality
     */
    var STATE_CHANGE_COUNT = 0;

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      STATE_CHANGE_COUNT += 1;
    });

    $rootScope.goBack = function () {

      if (STATE_CHANGE_COUNT > 1) {
        history.back();
      } else {
        $state.go('^');
      }
    };

    /**
     * State attributes
     */
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      $scope.bodyClasses = toState.bodyClasses || '';
      $scope.appTitle    = toState.appTitle || 'Cebola';
    });

    $rootScope.logOut = function () {
      accountAPI.logOut();
    };

    /**
     * Application methods
     */
    $scope.setAppTitle = function (title) {
      $scope.appTitle = title;
    };


  });
  
})();
