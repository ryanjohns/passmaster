function Accounts() {};

Accounts.init = function() {
  $('#accounts_email_placeholder').html(userData.email);
  if (!userData.verified)
    $('#verify_email_notice').show();
  else
    $('#verify_email_notice').hide();
  this.selectView();
};

Accounts.afterDisplay = function() {
  if (!userData.masterPassword)
    $('#unlock_accounts_passwd').focus();
};

Accounts.refresh = function(data) {
  userData.updateAttributes(data);
  if (userData.masterPassword) {
    try {
      userData.decryptAccounts();
    } catch(err) {
      this.handleBadPassword();
      return;
    }
  }
  if ($('#unlock_accounts_passwd').attr('type') == 'password')
    $('#unlock_accounts_passwd').val('');
  this.init();
};

Accounts.handleBadPassword = function() {
  alert('Failed to decrypt accounts.');
  this.lock();
  var input = $('#unlock_accounts_passwd').get(0);
  input.selectionStart = 0;
  input.selectionEnd = 9999;
}

Accounts.selectView = function() {
  this.wipeAccountTiles();
  if (userData.masterPassword) {
    $('#lock_btn').show();
    $('#configure_btn').show();
    $('#refresh_link').show();
    $('#unlock_accounts').hide();
    $('#accounts_list').show();
    $('#total_accounts').attr('data-count', userData.numAccounts());
    $('#total_accounts').html($('#total_accounts').attr('data-count'));
    this.searchTiles($('#accounts_list_search').val());
  } else {
    $('#lock_btn').hide();
    $('#configure_btn').hide();
    $('#refresh_link').hide();
    $('#accounts_list').hide();
    $('#unlock_accounts').show();
  }
};

Accounts.wipeAccountTiles = function() {
  $('#account_tiles .account-data').remove();
  $('#num_accounts').data('count', 0);
  $('#num_accounts').html(0);
};

Accounts.getAccountHtml = function(account, url) {
  if (url.length > 0)
    return '<a href="' + url + '" target="_blank">' + account + '</a>';
  return account;
};

Accounts.addAccountTile = function(accountId, data) {
  var tile = $('#account_tiles .template').clone(true);
  tile.find('.read th.account').html(this.getAccountHtml(data.account, data.url));
  tile.find('.read input.username').val(data.username);
  tile.find('.read input.username').attr('title', data.username);
  tile.find('.read input.password').attr('data-password', data.password);
  tile.find('.read input.password').attr('readonly', 'readonly');
  tile.find('.read pre.notes').html(data.notes);
  if (data.notes.length == 0)
    tile.find('.read pre.notes').hide();
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

Accounts.addBlankTile = function() {
  var tile = $('#account_tiles .template').clone(true);
  tile.find('.read').hide();
  tile.removeClass('template');
  tile.addClass('account-data');
  tile.prependTo('#account_tiles');
  tile.show();
  tile.find('select.password-length').val(userData.passwordLength);
  tile.find('.write input.account').focus();
};

Accounts.resetTile = function(tile) {
  var data = userData.accounts[tile.attr('data-account-id')];
  tile.find('.read th.account').html(this.getAccountHtml(data.account, data.url));
  tile.find('.read input.username').val(data.username);
  tile.find('.read input.username').attr('title', data.username);
  tile.find('.read input.password').attr('data-password', data.password);
  tile.find('.read input.password').val('');
  tile.find('.read input.password').removeAttr('title');
  tile.find('.read input.password').attr('readonly', 'readonly');
  tile.find('.read button.password').html('Show');
  tile.find('.read pre.notes').html(data.notes);
  tile.find('.write input.account').val(data.account);
  tile.find('.write input.url').val(data.url);
  tile.find('.write input.username').val(data.username);
  tile.find('.write input.password').val(data.password);
  tile.find('.write textarea.notes').val(data.notes);
  tile.find('.write').hide();
  tile.find('.read').show();
};

Accounts.updateTile = function(tile) {
  var accountId = tile.attr('data-account-id');
  if (accountId)
    delete userData.accounts[accountId];
  else {
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
  tile.find('.read th.account').html(this.getAccountHtml(data.account, data.url));
  tile.find('.read input.username').val(data.username);
  tile.find('.read input.username').attr('title', data.username);
  tile.find('.read input.password').attr('data-password', data.password);
  tile.find('.read input.password').val('');
  tile.find('.read input.password').removeAttr('title');
  tile.find('.read input.password').attr('readonly', 'readonly');
  tile.find('.read button.password').html('Show');
  tile.find('.read pre.notes').html(data.notes);
  if (data.notes.length == 0)
    tile.find('.read pre.notes').hide();
  else
    tile.find('.read pre.notes').show();
  tile.find('.write').hide();
  tile.find('.read').show();
};

Accounts.removeTile = function(tile) {
  delete userData.accounts[tile.attr('data-account-id')];
  tile.remove();
  var span = $('#num_accounts');
  span.data('count', span.data('count') - 1);
  span.html(span.data('count'));
  span = $('#total_accounts');
  span.data('count', span.data('count') - 1);
  span.html(span.data('count'));
};

Accounts.searchTiles = function(term) {
  var count = 0;
  if (term == '') {
    $('.account-data[data-account-id]').hide();
    $('#show_all_tiles_btn').html('Show All');
  } else {
    var tile;
    for (accountId in userData.accounts) {
      tile = $('.account-data[data-account-id="' + accountId + '"]');
      if (this.shouldShowTile(term, userData.accounts[accountId])) {
        count++;
        if (tile.length > 0)
          tile.show();
        else
          this.addAccountTile(accountId, userData.accounts[accountId]);
      } else {
        tile.hide();
      }
    }
    this.sortTiles();
    $('#show_all_tiles_btn').html('Show None');
  }
  $('#num_accounts').data('count', count);
  $('#num_accounts').html(count);
};

Accounts.shouldShowTile = function(term, data) {
  if (term == '.' || term == '.*')
    return true;
  if (term == '')
    return false;
  var pattern = new RegExp(term, 'i');
  var txt = data.account + ' ' + data.url + ' ' + data.username + ' ' + data.password + ' ' + data.notes;
  return pattern.test($.trim(txt));
};

Accounts.sortTiles = function() {
  $('.account-data[data-account-id]:visible th.account').sortElements(function(a, b) {
    return $(a).text().toLowerCase() > $(b).text().toLowerCase() ? 1 : -1;
  }, function() {
    return $(this).closest('.account-tile').get(0);
  });
};

Accounts.lock = function() {
  userData.wipeMasterPassword();
  userData.wipeOldMasterPassword();
  userData.accounts = {};
  IdleTimeout.stopTimer();
  this.selectView();
  Util.displaySection('accounts');
};

Accounts.unlock = function(passwd) {
  userData.setMasterPassword(passwd);
  IdleTimeout.startTimer();
  $('#refresh_link').click();
};

$(function() {
  $('#verify_email_notice a').click(function(evt) {
    evt.preventDefault();
    Verify.init();
    Util.displaySection('verify');
  });

  $('#unlock_accounts_form').submit(function(evt) {
    evt.preventDefault();
    var passwd = $('#unlock_accounts_passwd').val();
    if (passwd.length == 0)
      alert('Bad password.');
    else
      Accounts.unlock(passwd);
  });

  $('button[data-show-password]').click(function(evt) {
    evt.preventDefault();
    var input = $(this).closest('.read').find('input.password');
    if ($(this).html() == 'Show') {
      input.removeAttr('readonly');
      input.val(input.attr('data-password'));
      input.attr('title', input.attr('data-password'));
      input = input.get(0);
      input.selectionStart = 0;
      input.selectionEnd = 9999;
      $(this).html('Hide');
    } else {
      input.val('');
      input.removeAttr('title');
      input.attr('readonly', 'readonly');
      $(this).html('Show');
    }
  });

  $('.read .click-to-select').click(function(evt) {
    evt.preventDefault();
    var input = $(this).find('input').get(0);
    if (input.value) {
      input.selectionStart = 0;
      input.selectionEnd = 9999;
    }
  });

  $('.read input.username, .read input.password').keydown(function(evt) {
    if (!(evt.which >= 37 && evt.which <= 40) && !((evt.metaKey || evt.ctrlKey) && String.fromCharCode(evt.which).toLowerCase() == 'c'))
      evt.preventDefault();
  }).bind('cut paste', function(evt) {
    evt.preventDefault();
  });

  $('#add_account_btn').click(function(evt) {
    evt.preventDefault();
    Accounts.addBlankTile();
  });

  $('button[data-cancel]').click(function(evt) {
    evt.preventDefault();
    var tile = $(this).closest('.account-tile');
    if (!tile.attr('data-account-id'))
      tile.remove();
    else
      Accounts.resetTile(tile);
  });

  $('button[data-account-edit]').click(function(evt) {
    evt.preventDefault();
    var tile = $(this).closest('.account-tile');
    tile.find('.read').hide();
    tile.find('button[data-account-delete]').show();
    tile.find('.write').show();
    var passwdLength = tile.find('.write input.password').val().length;
    if (passwdLength == 0)
      passwdLength = userData.passwordLength;
    tile.find('select.password-length').val(passwdLength);
    if (!tile.attr('data-account-id'))
      tile.find('.write input.account').focus();
  });

  $('button[data-account-delete]').click(function(evt) {
    evt.preventDefault();
    if (!confirm('Are you sure you want to delete this account?'))
      return;
    var tile = $(this).closest('.account-tile');
    var accounts = $.extend(true, {}, userData.accounts);
    delete accounts[tile.attr('data-account-id')];
    try {
      userData.setEncryptedData(accounts);
    } catch(err) {
      alert('Failed to encrypt accounts.');
      return;
    }
    var form = tile.find('.update form');
    form.data('deletedAccount', 'true');
    form.submit();
  });

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
      alert('Account Name cannot be blank.');
      return;
    } else if (oldAccountId != accountId && userData.accounts[accountId]) {
      alert('An account with that name already exists.');
      return;
    }
    var accounts = $.extend(true, {}, userData.accounts);
    if (oldAccountId)
      delete accounts[oldAccountId];
    accounts[accountId] = data;
    try {
      userData.setEncryptedData(accounts);
    } catch(err) {
      alert('Failed to encrypt accounts.');
      return;
    }
    var form = tile.find('.update form');
    form.data('deletedAccount', 'false');
    form.submit();
  });

  $('#account_tiles .update form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    var tile = $(this).closest('.account-tile');
    if ($(this).data('deletedAccount') == 'true')
      Accounts.removeTile(tile);
    else
      Accounts.updateTile(tile);
  }).bind('ajax:error', function(evt, xhr) {
    var form = $(this);
    Util.handleOtpErrors(xhr, function() {
      form.submit();
    }, function() {
      alert(Util.extractErrors(xhr));
    });
  }).bind('ajax:before', function() {
    $(this).find('input.api-key').val(userData.apiKey);
    $(this).find('input.encrypted-data').val(userData.encryptedData);
    $(this).find('input.schema-version').val(Schema.currentVersion);
  }).bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    var btns = $(this).closest('.account-tile').find('.write form .btn');
    btns.attr('disabled', 'disabled');
  }).bind('ajax:complete', function() {
    var btns = $(this).closest('.account-tile').find('.write form .btn');
    btns.removeAttr('disabled');
  });

  $('#refresh_link').bind('ajax:success', function(evt, data) {
    Accounts.refresh(data);
  }).bind('ajax:error', function(evt, xhr) {
    Util.handleOtpErrors(xhr, function() {
      $('#refresh_link').click();
    }, function() {
      if (xhr.status == 401)
        Accounts.handleBadPassword();
      else if (xhr.status == 404)
        Util.wipeData();
      else {
        if (localStorage.userAttributes)
          Accounts.refresh(JSON.parse(localStorage.userAttributes));
        Util.enableReadOnly();
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

  $('#configure_btn').click(function(evt) {
    evt.preventDefault();
    if (Util.confirmUnsavedChanges()) {
      Configure.init();
      Util.displaySection('configure');
    }
  });

  $('#lock_btn').click(function(evt) {
    evt.preventDefault();
    if (Util.confirmUnsavedChanges())
      Accounts.lock();
  });

  $('#accounts_list_search').keyup(function() {
    Util.typewatch($(this).val(), 'Accounts.searchTiles(currentVal);', 250);
  });

  $('#show_all_tiles_btn').click(function(evt) {
    evt.preventDefault();
    var searchBox = $('#accounts_list_search');
    var value = (searchBox.val() == '') ? '.' : '';
    searchBox.val(value);
    Util.timerVal = value;
    Accounts.searchTiles(value);
  });

  $('button[data-password-generator]').click(function(evt) {
    evt.preventDefault();
    var div = $(this).closest('.write');
    var length = div.find('select.password-length').val();
    var specials = div.find('input.special-characters').get(0).checked;
    var passwd = Passwords.generate(length, specials);
    div.find('input.password').val(passwd);
  });
});
