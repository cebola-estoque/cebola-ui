angular.module('cebola.services')
.factory('accountAPI', function ($http, $q, uiTemporaryPasswordDialog, CONFIG) {
  var accountAPI = {};

  const TOKEN_KEY = 'cebola_auth_token';

  var API_URI = CONFIG.accountApiURI;

  accountAPI.clearAuthToken = function () {
    window.localStorage.removeItem(TOKEN_KEY);
  };

  accountAPI.ensureAuthToken = function () {

    var localStorageToken = window.localStorage.getItem(TOKEN_KEY);

    if (localStorageToken) {
      return $q.resolve(localStorageToken);
    } else {
      return uiTemporaryPasswordDialog.prompt()
        .then(function(temporaryPassword) {
          return $http.post(
            API_URI + '/temporary-token/generate',
            {
              password: temporaryPassword
            }
          )
        })
        .then(function (res) {
          var accountData = res.data;

          // store the token
          window.localStorage.setItem(TOKEN_KEY, accountData.token);

          return accountData.token;
        });
    }
  };

  accountAPI.injectAuthorizationHeader = function (fn) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);

      return accountAPI.ensureAuthToken().then(function (token) {
        args.unshift({
          'Authorization': 'Bearer ' + token,
        });

        return fn.apply(null, args);
      });
    };
  };

  accountAPI.logOut = function () {
    accountAPI.clearAuthToken();
    window.location.reload();
  };

  return accountAPI;
})

// http interceptor that shows loading indicator on ajax request
.config(function($httpProvider) {
  const TOKEN_KEY = 'cebola_auth_token';

  // alternatively, register the interceptor via an anonymous factory
  $httpProvider.interceptors.push(function($q, $rootScope, $injector) {
    return {
      // optional method
      responseError: function(errorResponse) {

        var accountAPI = $injector.get('accountAPI');

        var isUnauthorizedError = errorResponse.status === 401;
        var isLoginAttempt = errorResponse.config && errorResponse.config.url &&
          errorResponse.config.url.endsWith('/temporary-token/generate');

        if (isUnauthorizedError && !isLoginAttempt) {
          // unauthorized
          // should clear the local token
          window.localStorage.removeItem(TOKEN_KEY);

          accountAPI.clearAuthToken();

          return accountAPI.ensureAuthToken().then(function (token) {
            var retryHttpRequestConfig = angular.copy(errorResponse.config);

            // replace Authorization header
            retryHttpRequestConfig.headers = retryHttpRequestConfig.headers || {};
            retryHttpRequestConfig.headers['Authorization'] = 'Bearer ' + token;

            return $injector.get('$http')(retryHttpRequestConfig);
          });

        } else if (isLoginAttempt) {

          return accountAPI.ensureAuthToken().then(function () {
            window.location.reload();
          });

        } else {

          return $q.reject(errorResponse);
        }
      }
    };
  });
})
// .factory('accountTokenHttpRequestInterceptor', function () {

//   return {
//     request: function (config) {
//       return accountAPI.ensureAuthToken().then(function (account) {
//         console.log(account);

//         return config;
//       })
//     },
//   }
// });
