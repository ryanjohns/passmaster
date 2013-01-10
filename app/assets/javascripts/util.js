function Util() {};

Util.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

Util.extractErrors = function(xhr) {
  var errors;
  try {
    errors = JSON.parse(xhr.responseText).errors;
  } catch(err) {
    return 'An unexpected error has occurred.';
  }
  var msg = 'The following errors were reported.\n';
  for (attr in errors) {
    msg += attr + ': ';
    for (var i = 0; i < errors[attr].length; i++) {
      if (i > 0)
        msg += ', ';
      msg += errors[attr][i];
    }
    msg += '\n';
  }
  return msg;
};

Util.enableReadOnly = function() {
  // overview
  $('#overview_btn').attr('disabled', 'disabled');
  $('#overview_form').bind('ajax:before', function() {
    return false;
  });

  // verify
  $('#verify_btn').attr('disabled', 'disabled');
  $('#verify_form').bind('ajax:before', function() {
    return false;
  });
  $('#verify_send_code_link').attr('disabled', 'disabled');
  $('#verify_send_code_link').bind('ajax:before', function() {
    return false;
  });

  // configure
  $('#master_password_btn').attr('disabled', 'disabled');
  $('#change_email_btn').attr('disabled', 'disabled');
  $('#backup_accounts_btn').attr('disabled', 'disabled');
  $('#restore_accounts_btn').attr('disabled', 'disabled');

  // account
  $('button[data-account-delete]').attr('disabled', 'disabled');
  $('.account-tile .write input[type="submit"]').attr('disabled', 'disabled');

  // alert message
  $('#read_only').show();
};

Util.chooseSection = function() {
  var section = '';
  if (!userData || !userData.email)
    section = 'overview';
  else if (!userData.verified && !userData.configured)
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
  eval(this.capitalize(section) + '.afterDisplay()');
};

Util.initSection = function(section) {
  eval(this.capitalize(section) + '.init()');
};

Util.loadUser = function() {
  userData = new UserData();
  userData.updateAttributes(JSON.parse(localStorage.userAttributes));
};

Util.wipeData = function() {
  userData = null;
  localStorage.removeItem('userAttributes');
  Accounts.wipeAccountTiles();
  this.chooseSection();
};

Util.confirmUnsavedChanges = function() {
  return $('.account-tile .write:visible').length == 0 ||
      confirm('Are you sure? All unsaved changes will be lost.');
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
