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
    
    query = query || {};
    
    return $http.get(API_URI + '/product-models', {
      params: query,
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
  };
  api.productModel.search = function (searchText, query) {
    query = query || {};
    
    query.q = searchText;
    
    return api.productModel.list(query);
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
  api.organization.search = function (searchText, query) {
    query = query || {};
    
    query.q = searchText;
    
    return api.organization.list(query);
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
  api.shipment.scheduleEntry = function (supplier, shipmentData, allocationsData) {
    
    shipmentData.supplier = supplier;
    shipmentData.allocations = allocationsData;
    
    return $http.post(API_URI + '/shipments/entries', shipmentData, {
      headers: {
        // Authorization ...
      }
    })
    .then(function (res) {
      return res.data;
    });
    
  };
  api.shipment.listEntries = function (query) {
    return $http.get(API_URI + '/shipments/entries', {
      params: query,
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
  };
  api.shipment.scheduleExit = function (recipient, shipmentData, allocationsData) {
    shipmentData.recipient = recipient;
    shipmentData.allocations = allocationsData;
    
    return $http.post(API_URI + '/shipments/exits', shipmentData, {
      headers: {
        // Authorization ...
      }
    })
    .then(function (res) {
      return res.data;
    });
  };
  api.shipment.listExits = function (query) {
    return $http.get(API_URI + '/shipments/exits', {
      params: query,
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
  };
  api.shipment.getById = function (shipmentId) {
    return $http.get(API_URI + '/shipment/' + shipmentId, {
      params: {
        withRecords: 'true'
      },
      // auth
    })
    .then(function (res) {
      
      var shipmentData = res.data;
      
      shipmentData.scheduledFor = new Date(shipmentData.scheduledFor);
      
      for (var allocationStatus in shipmentData.allocations) {
        shipmentData.allocations[allocationStatus].forEach(function (allocation) {
          if (!allocation.product || !allocation.product.expiry) {
            return;
          }
          
          allocation.product.expiry = new Date(allocation.product.expiry);
        });
      }
      
      for (var operationStatus in shipmentData.operations) {
        shipmentData.operations[operationStatus].forEach(function (operation) {
          if (!operation.product || !operation.product.expiry) {
            return;
          }
          
          operation.product.expiry = new Date(operation.product.expiry);
        });
      }
      
      return shipmentData;
    });
  };
  api.shipment.update = function (shipmentId, shipmentData) {
    return $http.put(API_URI + '/shipment/' + shipmentId, shipmentData, {
      headers: {
        // Authorization
      }
    })
    .then(function (res) {
      return res.data;
    });
  };
  api.shipment.createAllocations = function (shipmentId, allocations) {
    return $http.post(
      API_URI + '/shipment/' + shipmentId + '/allocations',
      allocations,
      {
        headers: {
          // Authorization
        }
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  api.shipment.updateAllocations = function (shipmentId, allocations) {
    return $http.put(
      API_URI + '/shipment/' + shipmentId + '/allocations', allocations,
      {
        headers: {
          // Authorization
        }
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  api.shipment.cancelAllocations = function (shipmentId, allocations) {
    return $http.delete(
      API_URI + '/shipment/' + shipmentId + '/allocations',
      {
        data: allocations,
        headers: {
          // Authorization
          'Content-Type': 'application/json'
        }
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  api.shipment.effectivateAllocation = function (shipmentId, allocationId, quantity) {
    return $http.post(
      API_URI + '/shipment/' + shipmentId + '/allocation/' + allocationId + '/effectivate',
      {
        quantity: quantity
      },
      {
        headers: {
          // Autohrizaiton
        }
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  api.shipment.finish = function (shipmentId, finishData) {
    return $http.post(
      API_URI + '/shipment/' + shipmentId + '/finish',
      finishData,
      {
        headers: {
          // Authorization
        }
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  
  /**
   * Inventory API
   */
  api.inventory = {};
  api.inventory.summary = function () {
    return $http.get(API_URI + '/inventory/summary', {
      // auth
    })
    .then(function (res) {
      return res.data;
    });
  };
  api.inventory.availabilitySummary = function (date) {
    return $http.get(API_URI + '/inventory/availability-summary', {
      // auth
      params: {
        date: date,
      },
    })
    .then(function (res) {
      return res.data;
    });
  };
  api.inventory.shipmentSummary = function (shipmentId) {
    return $http.get(API_URI + '/inventory/shipment/' + shipmentId, {
      // auth
    })
    .then(function (res) {
      return res.data;
    });
  };
  
  return api;
  
});
