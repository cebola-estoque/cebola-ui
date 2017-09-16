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
});
