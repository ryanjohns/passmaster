(function(Overview, $, undefined) {

  Overview.init = function() {
    bindForm();
  };

  Overview.beforeDisplay = function() {
    $('#overview_email').val(Util.getParameterByName('email'));
  };

  Overview.afterDisplay = function() {};

  // DOM bindings
  function bindForm() {
    $('#overview_form').bind('ajax:success', function(evt, data) {
      userData = new UserData();
      userData.updateAttributes(data);
      I18n.setLanguage(userData.language);
      Overview.beforeDisplay();
      Util.chooseSection();
    }).bind('ajax:error', function(evt, xhr) {
      Util.notify(Util.extractErrors(xhr), 'error');
    }).bind('ajax:beforeSend', function() {
      var btn = $('#overview_btn');
      btn.attr('disabled', 'disabled');
      btn.val(I18n.translate('general.please_wait'));
    }).bind('ajax:complete', function() {
      var btn = $('#overview_btn');
      btn.val(I18n.translate('overview.access_accounts'));
      btn.removeAttr('disabled');
    });
  };

}(window.Overview = window.Overview || {}, jQuery));

$(function() {
  Overview.init();
});
