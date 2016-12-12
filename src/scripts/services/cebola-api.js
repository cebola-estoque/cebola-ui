angular.module('cebola.services')
.factory('cebolaAPI', function ($http, CONFIG) {
  
  var api = {};
  
  var API_URI = CONFIG.cebolaApiURI;
  
  /**
   * Product model API
   */
  api.productModel = {};
  api.productModel.create = function (productModel) {
    
    return $http.post(API_URI + '/product-models', productModel, {
      headers: {
        // Authorization ...
      }
    })
    .then(function (res) {
      return res.data;
    });
    
  };
  api.productModel.list = function (query) {
    return $http.get(API_URI + '/product-models', {
      query: query,
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
  };
  api.productModel.update = function (productModelId, productModel) {
    return $http.put(API_URI + '/product-model/' + productModelId, productModel, {
      headers: {
        // Authorization
      }
    })
  };
  api.productModel.delete = function (productModelId) {
    return $http.delete(API_URI + '/product-model/' + productModelId, {
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
  };
  
  /**
   * Organizations API
   */
  api.organization = {};
  api.organization.create = function (organization) {
    
    return $http.post(API_URI + '/organizations', organization, {
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
    
  };
  api.organization.list = function (query) {
    
    query = query || {};
    
    if (Array.isArray(query.roles)) {
      query.roles = query.roles.join(',');
    }
    
    return $http.get(API_URI + '/organizations', {
      params: query,
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
    
  };
  api.organization.update = function (organizationId, organizationData) {
    
    return $http.put(API_URI + '/organization/' + organizationId, organizationData, {
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
    
  };
  api.organization.delete = function (organizationId) {
    return $http.delete(API_URI + '/organization/' + organizationId, {
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
  };
  
  /**
   * Shipments API
   */
  api.shipment = {};
  
  
  /**
   * Inventory API
   */
  api.inventory = {};
  
  return api;
  
});
