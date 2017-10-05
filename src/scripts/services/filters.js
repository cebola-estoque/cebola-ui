angular.module('cebola.services')
.filter('code', function () {
  return function (input, codeType) {

    if (!input) {
      return;
    }

    switch (codeType) {
      case 'entry-shipment-operation':
        var code = [
          // use the sourceShipment as it is required
          'E' + input.product.sourceShipment.number,
          'O' + input.number
        ];
        
        return code.join('-')
        break;
      case 'exit-shipment-operation':
        var code = [
          // the shipment in exit operations is required
          'S' + input.shipment.number,
          'O' + input.number
        ];
        
        return code.join('-')
        break;
      default:
        return input.number;
        break;
    }
  }
})

.filter('document', function () {
  return function (shipment, documentName) {
    if (shipment && shipment.document && shipment.document[documentName]) {
      return shipment.document[documentName];
    } else {
      return '<span style="color: red;">não informado</span>';
    }
  }
});