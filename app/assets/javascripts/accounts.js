(function(Accounts, $, undefined) {

  Accounts.init = function() {
    bindVerifyEmailLink();
    bindRemoteUpdateNoticeLink();
    bindUnlockAccountsForm();
    bindUnlockWithTouchIDBtn();
    bindAddAccountBtn();
    bindClickToCopy();
    bindToggleNotes();
    bindEditAccountBtn();
    bindCancelEditAccountBtn();
    bindDeleteAccountBtn();
    bindGeneratePasswordBtn();
    bindSaveAccountForm();
    bindHiddenSaveAccountForm();
    bindRefreshLink();
    bindLockBtn();
    bindAccountSearch();
    bindSettings();
  };

  Accounts.beforeDisplay = function() {
    $('#accounts_email_placeholder').html(userData.email);
    if (!userData.verified) {
      $('#verify_email_notice').show();
    } else {
      $('#verify_email_notice').hide();
    }
    $('#remote_update_notice').hide();
    if (!Util.isIOS() && !Util.isAndroid()) {
      $('#restore_accounts_list_item').show();
    }
    selectView();
  };

  Accounts.afterDisplay = function() {
    if (userData.masterPassword) {
      Accounts.searchTiles($('#accounts_list_search').val());
      $('#accounts_list_search').get(0).setSelectionRange(0, 9999);
    } else if (!Util.isIOSApp()) {
      $('#unlock_accounts_passwd').focus();
    }
  };

  Accounts.wipeAccountTiles = function() {
    $('#account_tiles .account-data').remove();
    $('#num_accounts').data('count', 0);
    $('#num_accounts').html(0);
  };

  Accounts.searchTiles = function(term) {
    var count = 0;
    if (term == '') {
      $('.account-data[data-account-id]').hide();
      $('#show_all_tiles_btn').html('All');
    } else {
      var tile;
      for (accountId in userData.accounts) {
        tile = $('.account-data[data-account-id="' + accountId + '"]');
        if (shouldShowTile(term, userData.accounts[accountId])) {
          count++;
          if (tile.length > 0) {
            tile.show();
          } else {
            addAccountTile(accountId, userData.accounts[accountId]);
          }
        } else {
          tile.hide();
        }
      }
      sortTiles();
      $('#show_all_tiles_btn').html('None');
    }
    $('#num_accounts').data('count', count);
    $('#num_accounts').html(count);
  };

  Accounts.lock = function() {
    if (userData) {
      userData.wipeMasterPassword();
      userData.wipeOldMasterPassword();
      userData.accounts = {};
    }
    IdleTimeout.stopTimer();
    selectView();
    Util.displaySection('accounts');
  };

  function unlock(passwd) {
    userData.setMasterPassword(passwd);
    IdleTimeout.startTimer();
    $('#refresh_link').click();
  };

  function refresh(data) {
    userData.updateAttributes(data);
    try {
      userData.decryptAccounts();
    } catch(err) {
      handleBadPassword();
      return;
    }
    if ($('#unlock_accounts_passwd').attr('type') == 'password') {
      $('#unlock_accounts_passwd').val('');
    }
    Accounts.beforeDisplay();
    Accounts.searchTiles($('#accounts_list_search').val());
    $('#accounts_list_search').focus();
    if (Util.isIOSApp()) {
      MobileApp.savePasswordForTouchID();
    }
  };

  function handleBadPassword() {
    Util.notify('Failed to decrypt accounts.', 'error');
    Accounts.lock();
    if ($('#unlock_accounts_passwd').val().length > 0) {
      $('#unlock_accounts_passwd').get(0).setSelectionRange(0, 9999);
    }
  }

  function selectView() {
    Accounts.wipeAccountTiles();
    if (userData.masterPassword) {
      $('#unlock_accounts').hide();
      $('#lock_btn').show();
      $('#settings_btn').show();
      $('#refresh_link').show();
      $('#accounts_list').show();
      $('#total_accounts').attr('data-count', userData.numAccounts());
      $('#total_accounts').html($('#total_accounts').attr('data-count'));
    } else {
      if (Util.isIOSApp()) {
        MobileApp.checkForTouchIDAndPassword();
      }
      $('#lock_btn').hide();
      $('#settings_btn').hide();
      $('#refresh_link').hide();
      $('#accounts_list').hide();
      $('#unlock_accounts').show();
    }
  };

  function getAccountHtml(account, url) {
    if (url.length > 0) {
      return '<a href="' + url + '" target="_blank">' + account + '</a>';
    }
    return account;
  };

  function addAccountTile(accountId, data) {
    var tile = $('#account_tiles .template').clone(true);
    tile.find('.read th.account').html(getAccountHtml(data.account, data.url));
    tile.find('.read input.username').val(data.username);
    var passwordInput = tile.find('.read input.password');
    passwordInput.attr('data-password', data.password);
    if (data.password.length > 0) {
      passwordInput.val(passwordInput.attr('data-default-value'));
    }
    tile.find('.read p.notes').html(data.notes.replace(/\n/g, '<br>'));
    if (data.notes.length > 0) {
      tile.find('.read tr.no-notes').hide();
      tile.find('.read tr.notes').show();
    }
    tile.find('.write input.account').val(data.account);
    tile.find('.write input.url').val(data.url);
    tile.find('.write input.username').val(data.username);
    tile.find('.write input.password').val(data.password);
    tile.find('.write textarea.notes').val(data.notes);
    tile.find('.write').hide();
    tile.removeClass('template');
    tile.addClass('account-data');
    tile.attr('data-account-id', accountId);
    tile.appendTo('#account_tiles');
    tile.show();
  };

  function addBlankTile() {
    var tile = $('#account_tiles .template').clone(true);
    tile.find('.read').hide();
    tile.removeClass('template');
    tile.addClass('account-data');
    tile.prependTo('#account_tiles');
    tile.show();
    tile.find('select.password-length').val(userData.passwordLength);
    tile.find('input.special-characters').get(0).checked = userData.specialChars;
    tile.find('.write input.account').focus();
  };

  function resetTile(tile) {
    var data = userData.accounts[tile.attr('data-account-id')];
    tile.find('.write input.account').val(data.account);
    tile.find('.write input.url').val(data.url);
    tile.find('.write input.username').val(data.username);
    tile.find('.write input.password').val(data.password);
    tile.find('.write textarea.notes').val(data.notes);
    tile.find('.write').hide();
    tile.find('.read').show();
  };

  function updateTile(tile) {
    var accountId = tile.attr('data-account-id');
    if (accountId) {
      delete userData.accounts[accountId];
    } else {
      var span = $('#num_accounts');
      span.data('count', span.data('count') + 1);
      span.html(span.data('count'));
      span = $('#total_accounts');
      span.data('count', span.data('count') + 1);
      span.html(span.data('count'));
    }
    var data = {
      'account': tile.find('.write input.account').val(),
      'url': tile.find('.write input.url').val(),
      'username': tile.find('.write input.username').val(),
      'password': tile.find('.write input.password').val(),
      'notes': tile.find('.write textarea.notes').val()
    };
    accountId = Crypto.sha256(data.account);
    userData.accounts[accountId] = data;
    tile.attr('data-account-id', accountId);
    tile.find('.read th.account').html(getAccountHtml(data.account, data.url));
    tile.find('.read input.username').val(data.username);
    var passwordInput = tile.find('.read input.password');
    passwordInput.attr('data-password', data.password);
    if (data.password.length == 0) {
      passwordInput.val('');
    } else {
      passwordInput.val(passwordInput.attr('data-default-value'));
    }
    tile.find('.read p.notes').html(data.notes.replace(/\n/g, '<br>'));
    if (data.notes.length == 0) {
      tile.find('.read tr.notes').hide();
      tile.find('.read tr.no-notes').show();
    } else {
      tile.find('.read tr.no-notes').hide();
      tile.find('.read tr.notes').show();
    }
    tile.find('.write').hide();
    tile.find('.read').show();
  };

  function removeTile(tile) {
    delete userData.accounts[tile.attr('data-account-id')];
    tile.remove();
    var span = $('#num_accounts');
    span.data('count', span.data('count') - 1);
    span.html(span.data('count'));
    span = $('#total_accounts');
    span.data('count', span.data('count') - 1);
    span.html(span.data('count'));
  };

  function shouldShowTile(term, data) {
    if (term == '.' || term == '.*') {
      return true;
    }
    if (term == '') {
      return false;
    }
    var pattern = new RegExp(term, 'i');
    var txt = data.account + ' ' + data.url + ' ' + data.username + ' ' + data.notes;
    return pattern.test($.trim(txt));
  };

  function sortTiles() {
    $('.account-data[data-account-id]:visible th.account').sortElements(function(a, b) {
      return $(a).text().toLowerCase() > $(b).text().toLowerCase() ? 1 : -1;
    }, function() {
      return $(this).closest('.account-tile').get(0);
    });
  };

  // DOM bindings
  function bindVerifyEmailLink() {
    $('#verify_email_notice a').click(function(evt) {
      evt.preventDefault();
      Verify.beforeDisplay();
      Util.displaySection('verify');
    });
  };

  function bindRemoteUpdateNoticeLink() {
    $('#remote_update_notice a').click(function(evt) {
      evt.preventDefault();
      $('#refresh_link').click();
    });
  };

  function bindUnlockAccountsForm() {
    $('#unlock_accounts_form').submit(function(evt) {
      evt.preventDefault();
      var passwd = $('#unlock_accounts_passwd').val();
      if (passwd.length == 0) {
        Util.notify('Bad password.', 'error');
      } else {
        unlock(passwd);
      }
    });
  };

  function bindUnlockWithTouchIDBtn() {
    $('#unlock_touchid_btn').click(function(evt) {
      evt.preventDefault();
      if (Util.isIOSApp()) {
        MobileApp.authenticateWithTouchID();
      }
    });
  }

  function bindAddAccountBtn() {
    $('#add_account_btn').click(function(evt) {
      evt.preventDefault();
      addBlankTile();
    });
  };

  function bindClickToCopy() {
    $('.read .click-to-copy-username').click(function(evt) {
      evt.preventDefault();
      var input = $(this).find('input.username');
      if (input.val()) {
        if (Util.isAndroidApp()) {
          try {
            AndroidJs.copyToClipboard(input.val());
            Util.highlightElement(input, '#9cf');
            Util.notify('Username Copied');
          } catch(err) {
            // do nothing
          }
        } else if (Util.isIOSApp()) {
          MobileApp.copyToIOSClipboard(input.val());
          Util.highlightElement(input, '#9cf');
          Util.notify('Username Copied');
        } else if (!Util.isAndroid()) {
          input.get(0).setSelectionRange(0, 9999);
        }
      }
    });

    $('.read .click-to-copy-password').click(function(evt) {
      evt.preventDefault();
      var input = $(this).find('input.password');
      if (input.attr('data-password')) {
        if (!Util.isIOSApp() && !Util.isAndroidApp() && input.attr('data-password-visible') == 'false') {
          input.data('origText', input.val());
          input.val(input.attr('data-password'));
          input.attr('data-password-visible', 'true');
        }
        if (Util.isAndroidApp()) {
          try {
            AndroidJs.copyToClipboard(input.attr('data-password'));
            Util.highlightElement(input, '#9cf');
            Util.notify('Password Copied');
          } catch(err) {
            // do nothing
          }
        } else if (Util.isIOSApp()) {
          MobileApp.copyToIOSClipboard(input.attr('data-password'));
          Util.highlightElement(input, '#9cf');
          Util.notify('Password Copied');
        } else if (!Util.isAndroid()) {
          input.get(0).setSelectionRange(0, 9999);
        }
      }
    });

    $('.read input.password').bind('blur', function() {
      var input = $(this);
      if (input.attr('data-password-visible') == 'true') {
        input.val(input.data('origText'));
        input.attr('data-password-visible', 'false');
      }
    });

    $('.read input.username, .read input.password').keydown(function(evt) {
      if (!(evt.which >= 37 && evt.which <= 40) && !((evt.metaKey || evt.ctrlKey) && String.fromCharCode(evt.which).toLowerCase() == 'c')) {
        evt.preventDefault();
      }
    }).bind('cut paste', function(evt) {
      evt.preventDefault();
    });

    if (Util.isIOSApp() || Util.isAndroidApp()) {
      $('.read .click-to-copy-username').find('input.username').attr('disabled', true);
      $('.read .click-to-copy-password').find('input.password').attr('disabled', true);
      $('.read .click-to-copy-password').find('input.password').attr('data-default-value', 'tap to copy');
    }
  };

  function bindToggleNotes() {
    $('a[data-show-notes]').click(function(evt) {
      evt.preventDefault();
      var notes = $(this).parent().find('div.notes');
      notes.toggle();
      if (notes.is(':visible')) {
        $(this).html('Hide Notes');
      } else {
        $(this).html('Show Notes');
      }
    });
  };

  function bindEditAccountBtn() {
    $('button[data-account-edit]').click(function(evt) {
      evt.preventDefault();
      var tile = $(this).closest('.account-tile');
      tile.find('.read').hide();
      tile.find('button[data-account-delete]').show();
      tile.find('.write').show();
      var passwd = tile.find('.write input.password').val();
      if (passwd.length == 0) {
        tile.find('select.password-length').val(userData.passwordLength);
        tile.find('input.special-characters').get(0).checked = userData.specialChars;
      } else {
        tile.find('select.password-length').val(passwd.length);
        tile.find('input.special-characters').get(0).checked = /\W/.test(passwd);
      }
    });
  };

  function bindCancelEditAccountBtn() {
    $('button[data-cancel]').click(function(evt) {
      evt.preventDefault();
      var tile = $(this).closest('.account-tile');
      if (!tile.attr('data-account-id')) {
        tile.remove();
      } else {
        resetTile(tile);
      }
    });
  };

  function bindDeleteAccountBtn() {
    $('button[data-account-delete]').click(function(evt) {
      evt.preventDefault();
      if (!confirm('Are you sure you want to delete this account?')) {
        return;
      }
      var tile = $(this).closest('.account-tile');
      var accounts = $.extend(true, {}, userData.accounts);
      delete accounts[tile.attr('data-account-id')];
      try {
        userData.setEncryptedData(accounts);
      } catch(err) {
        Util.notify('Failed to encrypt accounts.', 'error');
        return;
      }
      var form = tile.find('.update form');
      form.data('deletedAccount', 'true');
      form.submit();
    });
  };

  function bindGeneratePasswordBtn() {
    $('button[data-password-generator]').click(function(evt) {
      evt.preventDefault();
      var div = $(this).closest('.write');
      var length = div.find('select.password-length').val();
      var specials = div.find('input.special-characters').get(0).checked;
      var passwd = Passwords.generate(length, specials);
      div.find('input.password').val(passwd);
    });
  };

  function bindSaveAccountForm() {
    $('#account_tiles .write form').submit(function(evt) {
      evt.preventDefault();
      var tile = $(this).closest('.account-tile');
      var data = {
        'account': $(this).find('input.account').val(),
        'url': $(this).find('input.url').val(),
        'username': $(this).find('input.username').val(),
        'password': $(this).find('input.password').val(),
        'notes': $(this).find('textarea.notes').val()
      };
      if (data.url.length > 0 && !/^https?:\/\//i.test(data.url)) {
        data.url = 'http://' + data.url;
        $(this).find('input.url').val(data.url);
      }
      var oldAccountId = tile.attr('data-account-id');
      var accountId = Crypto.sha256(data.account);
      if (data.account.length == 0) {
        Util.notify('Account Name cannot be blank.', 'error');
        return;
      } else if (oldAccountId != accountId && userData.accounts[accountId]) {
        Util.notify('An account with that name already exists.', 'error');
        return;
      }
      var accounts = $.extend(true, {}, userData.accounts);
      if (oldAccountId) {
        delete accounts[oldAccountId];
      }
      accounts[accountId] = data;
      try {
        userData.setEncryptedData(accounts);
      } catch(err) {
        Util.notify('Failed to encrypt accounts.', 'error');
        return;
      }
      var form = tile.find('.update form');
      form.data('deletedAccount', 'false');
      form.submit();
    });
  };

  function bindHiddenSaveAccountForm() {
    $('#account_tiles .update form').bind('ajax:success', function(evt, data) {
      userData.updateAttributes(data);
      var tile = $(this).closest('.account-tile');
      if ($(this).data('deletedAccount') == 'true') {
        removeTile(tile);
      } else {
        updateTile(tile);
      }
    }).bind('ajax:error', function(evt, xhr) {
      var form = $(this);
      Util.handleOtpErrors(xhr, function() {
        form.submit();
      }, function() {
        Util.notify(Util.extractErrors(xhr), 'error');
      });
    }).bind('ajax:before', function() {
      $(this).find('input.api-key').val(userData.apiKey);
      $(this).find('input.encrypted-data').val(userData.encryptedData);
      $(this).find('input.schema-version').val(Schema.currentVersion);
      $(this).find('input.version-code').val(userData.versionCode);
    }).bind('ajax:beforeSend', function(evt, xhr, settings) {
      settings.url = settings.url + '/' + userData.userId;
      var btns = $(this).closest('.account-tile').find('.write form .btn');
      btns.attr('disabled', 'disabled');
    }).bind('ajax:complete', function() {
      var btns = $(this).closest('.account-tile').find('.write form .btn');
      btns.removeAttr('disabled');
    });
  };

  function bindRefreshLink() {
    $('#refresh_link').bind('ajax:success', function(evt, data) {
      refresh(data);
    }).bind('ajax:error', function(evt, xhr) {
      Util.handleOtpErrors(xhr, function() {
        $('#refresh_link').click();
      }, function() {
        if (xhr.status == 401) {
          handleBadPassword();
        } else if (xhr.status == 404) {
          Util.wipeData();
        } else {
          if (localStorage.userAttributes) {
            refresh(JSON.parse(localStorage.userAttributes));
          }
          Util.enableOfflineMode();
        }
      });
    }).bind('ajax:before', function() {
      return Util.confirmUnsavedChanges();
    }).bind('ajax:beforeSend', function(evt, xhr, settings) {
      settings.url = settings.url + '/' + userData.userId + '?api_key=' + userData.apiKey;
      $('#refresh_spinner').show();
    }).bind('ajax:complete', function() {
      $('#refresh_spinner').hide();
    });
  };

  function bindLockBtn() {
    $('#lock_btn').click(function(evt) {
      evt.preventDefault();
      if (Util.confirmUnsavedChanges()) {
        Accounts.lock();
      }
    });
  };

  function bindAccountSearch() {
    $('#accounts_list_search').keyup(function() {
      Util.typewatch($(this).val(), 'Accounts.searchTiles(currentVal);', 250);
    });

    $('#show_all_tiles_btn').click(function(evt) {
      evt.preventDefault();
      var searchBox = $('#accounts_list_search');
      var value = (searchBox.val() == '') ? '.' : '';
      searchBox.val(value);
      Util.setTimerVal(value);
      Accounts.searchTiles(value);
    });
  };

  function bindSettings() {
    $('#preferences_link').click(function(evt) {
      evt.preventDefault();
      Settings.initPreferences();
      $('#preferences').modal('show');
    });
    $('#change_email_link').click(function(evt) {
      evt.preventDefault();
      if (Util.confirmUnsavedChanges()) {
        Settings.initChangeEmail();
        $('#change_email').modal('show');
      }
    });
    $('#master_password_link').click(function(evt) {
      evt.preventDefault();
      if (Util.confirmUnsavedChanges()) {
        Settings.initMasterPassword();
        $('#master_password').modal('show');
      }
    });
    $('#backup_accounts_link').click(function(evt) {
      evt.preventDefault();
      Settings.initBackupAccounts();
      $('#backup_accounts').modal('show');
    });
    $('#restore_accounts_link').click(function(evt) {
      evt.preventDefault();
      if (Util.confirmUnsavedChanges()) {
        Settings.initRestoreAccounts();
        $('#restore_accounts').modal('show');
      }
    });
  };

}(window.Accounts = window.Accounts || {}, jQuery));

$(function() {
  Accounts.init();
});
