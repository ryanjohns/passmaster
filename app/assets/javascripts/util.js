function Util() {};

Util.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

Util.extractErrors = function(xhr) {
  var errors;
  try {
    errors = JSON.parse(xhr.responseText).errors;
  } catch(err) {
    return 'An error has occurred. Please try again.';
  }
  var msg = "There are errors with the following fields.\n";
  for (attr in errors) {
    msg += attr + ': ';
    for (var i = 0; i < errors[attr].length; i++) {
      if (i > 0)
        msg += ', ';
      msg += errors[attr][i];
    }
    msg += "\n";
  }
  return msg;
};

Util.enableReadOnly = function() {
  $('#configure_btn').attr('disabled', 'disabled');
  $('#add_account_btn').attr('disabled', 'disabled');
  $('#set_master_password_btn').attr('disabled', 'disabled');
  $('button[data-account-edit]').attr('disabled', 'disabled');
  $('button[data-account-delete]').attr('disabled', 'disabled');
  $('.account-tile .write input[type="submit"]').attr('disabled', 'disabled');
  $('#reload_link').attr('href', '/');
  $('#reload_link').removeAttr('data-remote');
};

Util.chooseSection = function() {
  var section = '';
  if (!userData || !userData.email)
    section = 'overview';
  else if (!userData.verified)
    section = 'verify';
  else if (!userData.configured)
    section = 'configure';
  else
    section = 'accounts';
  this.initSection(section);
  this.displaySection(section);
}

Util.displaySection = function(section) {
  var sections = ['overview', 'verify', 'configure', 'accounts'];
  for (var i = 0; i < 4; i++) {
    if (sections[i] == section)
      $('#' + sections[i]).show();
    else
      $('#' + sections[i]).hide();
  }
};

Util.initSection = function(section) {
  eval(this.capitalize(section) + '.init();');
};

Util.lookupUser = function() {
  userData = new UserData();
  userData.updateAttributes(JSON.parse(localStorage.userAttributes));
  $('#reload_link').click();
};

Util.resetApp = function() {
  userData = null;
  localStorage.removeItem('userAttributes');
  Accounts.wipeAccountTiles();
  this.chooseSection();
};

Util.getParameterByName = function(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1]);
};

Util.timer;
Util.timerVal = '';
Util.typewatch = function(currentVal, callback, ms) {
  if (this.timerVal != currentVal) {
    this.timerVal = currentVal;
    if (this.timer != undefined)
      clearTimeout(this.timer);
    this.timer = setTimeout(function() {
      eval(callback);
    }, ms);
  }
};
