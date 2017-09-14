angular.module('cebola.services')
.factory('cebolaAPI', function ($http, CONFIG, accountAPI) {
  
  var cebolaAPI = {};
  
  var API_URI = CONFIG.cebolaApiURI;
  
  /**
   * Product model API
   */
  cebolaAPI.productModel = {};
  cebolaAPI.productModel.create = function (headers, productModel) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';
    
    return $http.post(API_URI + '/product-models', productModel, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.productModel.list = function (headers, query) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';
    
    query = query || {};
    
    return $http.get(API_URI + '/product-models', {
      params: query,
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.productModel.search = function (headers, searchText, query) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    query = query || {};
    
    query.q = searchText;
    
    return cebolaAPI.productModel.list(query);
  };
  cebolaAPI.productModel.update = function (headers, productModelId, productModel) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.put(API_URI + '/product-model/' + productModelId, productModel, {
      headers: headers,
    })
  };
  cebolaAPI.productModel.delete = function (headers, productModelId) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.delete(API_URI + '/product-model/' + productModelId, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  
  /**
   * Organizations API
   */
  cebolaAPI.organization = {};
  cebolaAPI.organization.create = function (headers, organization) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';
    
    return $http.post(API_URI + '/organizations', organization, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
    
  };
  cebolaAPI.organization.list = function (headers, query) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';
    
    query = query || {};
    
    if (Array.isArray(query.roles)) {
      query.roles = query.roles.join(',');
    }
    
    return $http.get(API_URI + '/organizations', {
      params: query,
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
    
  };
  cebolaAPI.organization.search = function (headers, searchText, query) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    query = query || {};
    
    query.q = searchText;
    
    return cebolaAPI.organization.list(query);
  };
  cebolaAPI.organization.update = function (headers, organizationId, organizationData) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';
    
    return $http.put(API_URI + '/organization/' + organizationId, organizationData, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
    
  };
  cebolaAPI.organization.delete = function (headers, organizationId) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.delete(API_URI + '/organization/' + organizationId, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  
  /**
   * Shipments API
   */
  cebolaAPI.shipment = {};
  cebolaAPI.shipment.scheduleEntry = function (headers, supplier, shipmentData, allocationsData) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';
    
    shipmentData.supplier = supplier;
    shipmentData.allocations = allocationsData;
    
    return $http.post(API_URI + '/shipments/entries', shipmentData, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
    
  };
  cebolaAPI.shipment.listEntries = function (headers, query) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.get(API_URI + '/shipments/entries', {
      params: query,
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.scheduleExit = function (headers, recipient, shipmentData, allocationsData) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    shipmentData.recipient = recipient;
    shipmentData.allocations = allocationsData;
    
    return $http.post(API_URI + '/shipments/exits', shipmentData, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.listExits = function (headers, query) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.get(API_URI + '/shipments/exits', {
      params: query,
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.getById = function (headers, shipmentId) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.get(API_URI + '/shipment/' + shipmentId, {
      headers: headers,
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
  cebolaAPI.shipment.cancel = function (headers, shipmentId) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.delete(API_URI + '/shipment/' + shipmentId, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.update = function (headers, shipmentId, shipmentData) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.put(API_URI + '/shipment/' + shipmentId, shipmentData, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.createAllocations = function (headers, shipmentId, allocations) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.post(
      API_URI + '/shipment/' + shipmentId + '/allocations',
      allocations,
      {
        headers: headers,
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.updateAllocations = function (headers, shipmentId, allocations) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.put(
      API_URI + '/shipment/' + shipmentId + '/allocations', allocations,
      {
        headers: headers,
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.cancelAllocations = function (headers, shipmentId, allocations) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.delete(
      API_URI + '/shipment/' + shipmentId + '/allocations',
      {
        data: allocations,
        headers: headers,
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.effectivateAllocation = function (headers, shipmentId, allocationId, quantity) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.post(
      API_URI + '/shipment/' + shipmentId + '/allocation/' + allocationId + '/effectivate',
      {
        quantity: quantity
      },
      {
        headers: headers,
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.createOperations = function (headers, shipmentId, operations) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.post(
      API_URI + '/shipment/' + shipmentId + '/operations',
      operations,
      {
        headers: headers,
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.shipment.finish = function (headers, shipmentId, finishData) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.post(
      API_URI + '/shipment/' + shipmentId + '/finish',
      finishData,
      {
        headers: headers,
      }
    )
    .then(function (res) {
      return res.data;
    });
  };

  /**
   * Operation API
   */
  cebolaAPI.operation = {};
  cebolaAPI.operation.list = function (headers, query) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.get(API_URI + '/operations', {
      params: query,
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.operation.createLoss = function (headers, operationData) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.post(
      API_URI + '/operations/loss',
      operationData,
      {
        headers: headers,
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.operation.createCorrection = function (headers, operationData) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.post(
      API_URI + '/operations/correction',
      operationData,
      {
        headers: headers,
      }
    )
    .then(function (res) {
      return res.data;
    });
  };
  
  /**
   * Inventory API
   */
  cebolaAPI.inventory = {};
  cebolaAPI.inventory.summary = function (headers, query) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    query = query || {};
    
    return $http.get(API_URI + '/inventory/summary', {
      // auth
      params: query,
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.inventory.availabilitySummary = function (headers, date) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';

    return $http.get(API_URI + '/inventory/availability-summary', {
      // auth
      params: {
        date: date,
      },
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };
  cebolaAPI.inventory.shipmentSummary = function (headers, shipmentId) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';
    
    return $http.get(API_URI + '/inventory/shipment/' + shipmentId, {
      headers: headers,
    })
    .then(function (res) {
      return res.data;
    });
  };

  /**
   * Add headers
   */
  Object.keys(cebolaAPI).forEach(function (section) {
    Object.keys(cebolaAPI[section]).forEach(function (method) {
      var fn = cebolaAPI[section][method];
      cebolaAPI[section][method] = accountAPI.injectAuthorizationHeader(fn);
    });
  });

  
  return cebolaAPI;
  
});
