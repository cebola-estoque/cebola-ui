angular.module('cebola.services')
.factory('util', function () {
  var util = {};

  /**
   * Array utilities
   */
  util.array = {};

  function arrayContains(container, item, identityFn) {
    return container.some((cItem) => {
      return identityFn(cItem, item);
    });
  }
  util.array.contains = arrayContains;

  function arrayDiff(source, target, identityFn, trackProperties) {
    
    identityFn = identityFn || function (a, b) {
      return a === b;
    }
    
    var remove = source.filter(function (sItem) {
      return !arrayContains(target, sItem, identityFn);
    });
    
    var create = target.filter(function (tItem) {
      return !arrayContains(source, tItem, identityFn);
    });
    
    var update = target.filter(function (tItem) {
      return source.some(function (sItem) {
        
        return identityFn(sItem, tItem) && trackProperties.some(function (prop) {
          return objectPath.get(tItem, prop) !== objectPath.get(sItem, prop);
        });
        
      });
    });
    
    return {
      remove: remove,
      create: create,
      update: update,
    };
  }
  util.array.diff = arrayDiff;
  
  /**
   * Product utilities
   */
  util.product = {};
  util.product.isValid = function (product) {
    return product.model._id && product.measureUnit && product.expiry;
  }
  util.product.isSameModel = function (modelA, modelB) {
    return modelA._id === modelB._id;
  };
  util.product.isSameMeasureUnit = function (measureUnitA, measureUnitB) {
    return measureUnitA === measureUnitB;
  };
  util.product.isSameExpiry = function (expiryA, expiryB) {
    expiryA = (expiryA instanceof Date) ? expiryA : new Date(expiryA);
    expiryB = (expiryB instanceof Date) ? expiryB : new Date(expiryB);

    return expiryA.getTime() === expiryB.getTime();
  };
  util.product.isSame = function (productA, productB) {
    if (!util.product.isValid(productA) || !util.product.isValid(productB)) {
      throw new Error('invalid products');
    }

    return util.product.isSameModel(productA.model, productB.model) &&
           util.product.isSameMeasureUnit(productA.measureUnit, productB.measureUnit) &&
           util.product.isSameExpiry(productA.expiry, productB.expiry);
  };

  return util;
});
