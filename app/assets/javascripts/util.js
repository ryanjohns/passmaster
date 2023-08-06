(function(Util, $, undefined) {

  var currentSection;
  var sections = ['overview', 'verify', 'configure', 'accounts'];
  var timer;
  var timerVal = '';
  var notificationTimer;
  var androidRegex = new RegExp('Android', 'i');
  var android = null;
  var androidAppRegex = new RegExp('PassmasterAndroid');
  var androidApp = null;
  var iOSRegex = new RegExp('(iPhone|iPod|iPad)', 'i');
  var iOS = null;
  var iOSAppRegex = new RegExp('PassmasterIOS');
  var iOSApp = null;

  Util.init = function() {
    registerServiceWorker();

    bindFormSubmit();
    bindLogoutBtn();
    bindReloadLink();
    bindInitSessionLink();

    $('input, textarea').placeholder();

    if (localStorage.userAttributes) {
      userData = new UserData();
      userData.updateAttributes(JSON.parse(localStorage.userAttributes));
      I18n.setLanguage(userData.language);
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
      return I18n.translate('util.unexpected_error');
    }
    if (errors['version_code']) {
      msg = I18n.translate('util.remote_update_detected');
      $('#remote_update_notice').show();
    } else {
      msg = I18n.translate('util.errors_reported') + '\n';
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
    $('#delete_account_btn').attr('disabled', 'disabled');

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
    if ($('#unlock_accounts_passwd').attr('type') == 'password') {
      $('#unlock_accounts_passwd').val('');
    }
    userData = null;
    localStorage.removeItem('userAttributes');
    Accounts.wipeAccountTiles();
    IdleTimeout.stopTimer();
    Util.chooseSection();
  };

  Util.confirmUnsavedChanges = function() {
    return $('.account-tile .write:visible').length == 0 || confirm(I18n.translate('util.confirm_unsaved_changes'));
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
      var otp = prompt(I18n.translate('util.must_auth'));
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
      Util.notify(I18n.translate('util.locked_out'), 'error');
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

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/offline_sw.js').then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          if (registration.active) {
            registration.addEventListener('updatefound', function() {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', function() {
                if (newWorker.state === 'activated') {
                  $('#cache_update_ready').show();
                }
              });
            });
          }
        }, function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
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

  function bindLogoutBtn() {
    $('button[data-logout]').click(function(evt) {
      evt.preventDefault();
      if (Util.confirmUnsavedChanges()) {
        if (confirm(I18n.translate('util.confirm_logout'))) {
          Util.wipeData();
          I18n.restoreBrowserLanguage();
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
      I18n.setBrowserLanguage(data.language);
      if (userData && userData.language && userData.language != '') {
        I18n.setLanguage(userData.language);
      } else {
        I18n.setLanguage(data.language);
      }
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
