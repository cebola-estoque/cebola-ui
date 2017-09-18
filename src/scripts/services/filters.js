angular.module('cebola.services')
.filter('code', function () {
  return function (input, codeType) {

    if (!input) {
      return;
    }

    switch (codeType) {
      case 'operation':
        var code = ['E' + input.product.sourceShipment.number];

        if (input.sourceAllocation && input.sourceAllocation.number) {
          code.push('A' + input.sourceAllocation.number);
        }

        code.push('O' + input.number);

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