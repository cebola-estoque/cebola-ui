angular.module('cebola.services')

.factory('uiErrorDialog', function ($mdDialog) {

  const DEFAULT_ALERT_DIALOG_OPTIONS = {
    title: 'Erro',
    textContent: 'Aconteceu um erro desconhecido. Por favor tente novamente.',
    ok: 'Fechar',
  };

  return {
    alert: function (dialogOptions) {

      dialogOptions = dialogOptions || {};

      if (typeof dialogOptions === 'string') {
        dialogOptions = {
          message: dialogOptions
        };
      }

      dialogOptions = Object.assign({}, DEFAULT_ALERT_DIALOG_OPTIONS, dialogOptions);
      
      $mdDialog.show(
        $mdDialog.alert(dialogOptions)
      );
    },
  };

})