(function(Util, $, undefined) {

  var currentSection;
  var sections = ['overview', 'verify', 'configure', 'accounts'];
  var timer;
  var timerVal = '';

  Util.init = function() {
    bindCacheReady();
    bindLogoutBtn();
    bindReloadLink();
    bindInitSessionLink();

    $('input, textarea').placeholder();

    if (localStorage.userAttributes) {
      loadUser();
    }

    Util.chooseSection();
    $('#init_session_link').click();
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
        if (i > 0) {
          msg += ', ';
        }
        msg += errors[attr][i];
      }
      msg += '\n';
    }
    return msg;
  };

  Util.enableOfflineMode = function() {
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
    $('#configure_btn').attr('disabled', 'disabled');

    // settings
    $('#master_password_btn').attr('disabled', 'disabled');
    $('#change_email_btn').attr('disabled', 'disabled');
    $('#preferences_btn').attr('disabled', 'disabled');
    $('#backup_accounts_file_btn').attr('disabled', 'disabled');
    $('#backup_accounts_email_btn').attr('disabled', 'disabled');
    $('#restore_accounts_btn').attr('disabled', 'disabled');

    // account
    $('button[data-account-delete]').attr('disabled', 'disabled');
    $('.account-tile .write input[type="submit"]').attr('disabled', 'disabled');

    // alert message
    $('#offline_mode').show();
  };

  Util.chooseSection = function() {
    var section = '';
    if (!userData || !userData.email) {
      section = 'overview';
    } else if (!userData.verified && !userData.configured) {
      section = 'verify';
    } else if (!userData.configured) {
      section = 'configure';
    } else {
      section = 'accounts';
    }
    eval(capitalize(section) + '.beforeDisplay()');
    Util.displaySection(section);
  };

  Util.displaySection = function(section) {
    for (i in sections) {
      if (sections[i] == section) {
        $('#' + sections[i]).show();
      } else {
        $('#' + sections[i]).hide();
      }
    }
    eval(capitalize(section) + '.afterDisplay()');
    currentSection = section;
  };

  Util.wipeData = function() {
    userData = null;
    localStorage.removeItem('userAttributes');
    Accounts.wipeAccountTiles();
    IdleTimeout.stopTimer();
    Util.chooseSection();
  };

  Util.confirmUnsavedChanges = function() {
    return $('.account-tile .write:visible').length == 0 || confirm('Are you sure? All unsaved changes will be lost.');
  };

  Util.getParameterByName = function(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1]);
  };

  Util.typewatch = function(currentVal, callback, ms) {
    if (timerVal != currentVal) {
      Util.setTimerVal(currentVal);
      if (timer != undefined) {
        clearTimeout(timer);
      }
      timer = setTimeout(function() {
        eval(callback);
      }, ms);
    }
  };

  Util.setTimerVal = function(value) {
    timerVal = value;
  };

  Util.handleOtpErrors = function(xhr, successCallback, errorCallback) {
    if (xhr.status == 412) {
      var otp = prompt('You must authenticate to continue. Please enter the current code from Google Authenticator.');
      if (otp) {
        $('#otp_session_user_id').val(userData.userId);
        $('#otp_session_api_key').val(userData.apiKey);
        $('#otp_session_otp').val(otp);
        $('#otp_session_form').unbind();
        $('#otp_session_form').bind('ajax:success', function() {
          successCallback();
        }).bind('ajax:error', function(evt, otpXhr) {
          Util.handleOtpErrors(otpXhr, successCallback, errorCallback);
        });
        $('#otp_session_form').submit();
      } else {
        errorCallback();
      }
    } else if (xhr.status == 423) {
      alert('This device has been locked out. Try another device or a different browser.');
      Util.wipeData();
    } else {
      errorCallback();
    }
  };

  // this function is required by the iOS app
  Util.appLoaded = function() {
    return 'YES';
  };

  // this function is required by the iOS app
  Util.updateAppCache = function() {
    window.applicationCache.update();
  };

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  function loadUser() {
    userData = new UserData();
    userData.updateAttributes(JSON.parse(localStorage.userAttributes));
  };

  // DOM bindings
  function bindCacheReady() {
    $(window.applicationCache).bind('updateready', function() {
      window.applicationCache.swapCache();
      $('#cache_update_ready').show();
    });
  };

  function bindLogoutBtn() {
    $('button[data-logout]').click(function(evt) {
      evt.preventDefault();
      if (Util.confirmUnsavedChanges()) {
        if (confirm('Are you sure you want to logout? This will make your accounts unavailable without an internet connection.')) {
          Util.wipeData();
        }
      }
    });
  };

  function bindReloadLink() {
    $('.reload-link').click(function(evt) {
      evt.preventDefault();
      location.reload();
    });
  };

  function bindInitSessionLink() {
    $('#init_session_link').bind('ajax:success', function(evt, data) {
      $('meta[name="csrf-token"]').attr('content', data.token);
      if (currentSection == 'overview' && $('#overview_email').val()) {
        $('#overview_form').submit();
      }
    }).bind('ajax:error', function() {
      Util.enableOfflineMode();
    });
  };

}(window.Util = window.Util || {}, jQuery));

$(function() {
  Util.init();
});
