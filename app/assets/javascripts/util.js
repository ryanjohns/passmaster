(function(Util, $, undefined) {

  var currentSection;
  var sections = ['overview', 'verify', 'configure', 'accounts'];
  var timer;
  var timerVal = '';
  var notificationTimer;
  var androidRegex = new RegExp('Android');
  var android = null;
  var androidAppRegex = new RegExp('PassmasterAndroid');
  var androidApp = null;
  var iOSRegex = new RegExp('iPhone');
  var iOS = null;
  var iOSAppRegex = new RegExp('PassmasterIOS');
  var iOSApp = null;

  Util.init = function() {
    bindFormSubmit();
    bindCacheReady();
    bindLogoutBtn();
    bindReloadLink();
    bindInitSessionLink();

    $('input, textarea').placeholder();

    if (localStorage.userAttributes) {
      userData = new UserData();
      userData.updateAttributes(JSON.parse(localStorage.userAttributes));
    }

    Util.chooseSection();
    $('#init_session_link').click();
  };

  Util.isMobile = function() {
    return (Util.isAndroid() || Util.isIOS());
  };

  Util.isAndroid = function() {
    if (android == null) {
      android = androidRegex.test(navigator.userAgent);
    }
    return android;
  };

  Util.isAndroidApp = function() {
    if (androidApp == null) {
      androidApp = androidAppRegex.test(navigator.userAgent);
    }
    return androidApp;
  };

  Util.isIOS = function() {
    if (iOS == null) {
      iOS = iOSRegex.test(navigator.userAgent);
    }
    return iOS;
  };

  Util.isIOSApp = function() {
    if (iOSApp == null) {
      iOSApp = iOSAppRegex.test(navigator.userAgent);
    }
    return iOSApp;
  };

  Util.extractErrors = function(xhr) {
    var errors, msg;
    try {
      errors = JSON.parse(xhr.responseText).errors;
    } catch(err) {
      return 'An unexpected error has occurred.';
    }
    if (errors['version_code']) {
      msg = 'Remote update detected. Please refresh your accounts to prevent data-loss.';
      $('#remote_update_notice').show();
    } else {
      msg = 'The following errors were reported.\n';
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
    if (Util.isIOSApp()) {
      MobileApp.deletePasswordForTouchID();
    }
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
      if (timer !== undefined) {
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
      Util.notify('This device has been locked out. Try another device or a different browser.', 'error');
      Util.wipeData();
    } else {
      errorCallback();
    }
  };

  Util.highlightElement = function(element, backgroundColor) {
    var origBackgroundColor = element.css('background-color');
    element.animate({ backgroundColor: backgroundColor }, {
      duration: 25,
      complete: function() {
        element.animate({ backgroundColor: origBackgroundColor }, { duration: 1000 });
      }
    });
  };

  Util.notify = function(message, status) {
    if (notificationTimer !== undefined) {
      clearTimeout(notificationTimer);
    }
    if ($('#notification').is(':visible')) {
      $('#notification').slideUp(200, function() {
        showNotification(message, status);
      });
    } else {
      showNotification(message, status);
    }
  };

  function showNotification(message, status) {
    if (status !== undefined && status == 'error') {
      $('#notification').attr('class', 'alert alert-error');
    } else {
      $('#notification').attr('class', 'alert alert-info');
    }
    $('#notification').html(message.replace(/\n/, '<br>'));
    $('#notification').slideDown(200);
    notificationTimer = setTimeout(function() {
      $('#notification').slideUp(400);
    }, 3000);
  };

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // DOM bindings
  function bindFormSubmit() {
    if (Util.isIOS()) {
      $('form').submit(function() {
        if (document.activeElement.nodeName == 'INPUT') {
          document.activeElement.blur();
        }
      });
    }
  };

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
