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
      Overview.beforeDisplay();
      Util.chooseSection();
    }).bind('ajax:error', function(evt, xhr) {
      Util.notify(Util.extractErrors(xhr), 'error');
    }).bind('ajax:beforeSend', function() {
      var btn = $('#overview_btn');
      btn.data('origText', btn.val());
      btn.attr('disabled', 'disabled');
      btn.val('Please Wait...');
    }).bind('ajax:complete', function() {
      var btn = $('#overview_btn');
      btn.val(btn.data('origText'));
      btn.removeAttr('disabled');
    });
  };

}(window.Overview = window.Overview || {}, jQuery));

$(function() {
  Overview.init();
});
