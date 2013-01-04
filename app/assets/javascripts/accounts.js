function Accounts() {};

Accounts.init = function() {
  $('#accounts_email_placeholder').html(userData.email);
  $('#accounts_list_search').val('');
  Util.timerVal = '';
  this.selectView();
};

Accounts.reload = function(data) {
  userData.updateAttributes(data);
  if (userData.masterPassword) {
    try {
      userData.decryptAccounts();
    } catch(err) {
      this.wipeAccountTiles();
      userData.wipeMasterPassword();
      alert('Failed to decrypt accounts.');
    }
  }
};

Accounts.selectView = function() {
  if (userData.masterPassword) {
    this.fillAccountTiles();
    $('#unlock_accounts').hide();
    $('#accounts_list').show();
  } else {
    $('#accounts_list').hide();
    $('#unlock_accounts').show();
  }
};

Accounts.fillAccountTiles = function() {
  this.wipeAccountTiles();
  for (accountId in userData.accounts)
    this.addAccountTile(accountId, userData.accounts[accountId]);
};

Accounts.wipeAccountTiles = function() {
  $('#account_tiles .account-data').remove();
};

Accounts.addAccountTile = function(accountId, data) {
  var tile = $('#account_tiles .template').clone(true);
  tile.find('.read th.account').html(data['account']);
  tile.find('.read input.username').val(data['username']);
  tile.find('.read input.username').attr('title', data['username']);
  tile.find('.read input.password').attr('data-password', data['password']);
  tile.find('.read pre.notes').html(data['notes']);
  if (data['notes'].length == 0)
    tile.find('.read pre.notes').hide();
  tile.find('.write input.account').val(data['account']);
  tile.find('.write input.username').val(data['username']);
  tile.find('.write input.password').val(data['password']);
  tile.find('.write textarea.notes').val(data['notes']);
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
};

Accounts.resetTile = function(tile) {
  var data = userData.accounts[tile.attr('data-account-id')];
  tile.find('.read th.account').html(data['account']);
  tile.find('.read input.username').val(data['username']);
  tile.find('.read input.username').attr('title', data['username']);
  tile.find('.read input.password').attr('data-password', data['password']);
  tile.find('.read input.password').val('');
  tile.find('.read input.password').removeAttr('title');
  tile.find('.read button.password').html('Show');
  tile.find('.read pre.notes').html(data['notes']);
  tile.find('.write input.account').val(data['account']);
  tile.find('.write input.username').val(data['username']);
  tile.find('.write input.password').val(data['password']);
  tile.find('.write textarea.notes').val(data['notes']);
  tile.find('.write').hide();
  tile.find('.read').show();
};

Accounts.updateTile = function(tile) {
  var accountId = tile.attr('data-account-id');
  if (accountId)
    delete userData.accounts[accountId];
  var data = {
    'account': tile.find('.write input.account').val(),
    'username': tile.find('.write input.username').val(),
    'password': tile.find('.write input.password').val(),
    'notes': tile.find('.write textarea.notes').val()
  };
  accountId = Crypto.sha256(data['account']);
  userData.accounts[accountId] = data;
  tile.attr('data-account-id', accountId);
  tile.find('.read th.account').html(data['account']);
  tile.find('.read input.username').val(data['username']);
  tile.find('.read input.username').attr('title', data['username']);
  tile.find('.read input.password').attr('data-password', data['password']);
  tile.find('.read input.password').val('');
  tile.find('.read input.password').removeAttr('title');
  tile.find('.read button.password').html('Show');
  tile.find('.read pre.notes').html(data['notes']);
  if (data['notes'].length == 0)
    tile.find('.read pre.notes').hide();
  else
    tile.find('.read pre.notes').show();
  tile.find('.write').hide();
  tile.find('.read').show();
};

Accounts.removeTile = function(tile) {
  delete userData.accounts[tile.attr('data-account-id')];
  tile.remove();
};

Accounts.searchTiles = function(term) {
  var pattern = new RegExp(term, 'i');
  for (accountId in userData.accounts) {
    var txt = userData.accounts[accountId]['account'] + ' ' +
        userData.accounts[accountId]['username'] + ' ' +
        userData.accounts[accountId]['notes'];
    if (pattern.test(txt))
      $('.account-data[data-account-id="' + accountId + '"]').show();
    else
      $('.account-data[data-account-id="' + accountId + '"]').hide();
  }
};

Accounts.unlock = function(passwd) {
  userData.setMasterPassword(passwd);
  try {
    userData.decryptAccounts();
  } catch(err) {
    alert('Failed to decrypt accounts.');
    return;
  }
  $('#unlock_accounts_passwd').val('');
  this.selectView();
};

$(function() {
  $('#unlock_accounts_form').submit(function() {
    var passwd = $('#unlock_accounts_passwd').val();
    if (passwd.length == 0)
      alert('Bad password.');
    else
      Accounts.unlock(passwd);
    return false;
  });

  $('button[data-show-password]').click(function() {
    var input = $(this).parent().find('input.password');
    if ($(this).html() == 'Show') {
      input.val(input.attr('data-password'));
      input.attr('title', input.attr('data-password'));
      input.select();
      $(this).html('Hide');
    } else {
      input.val('');
      input.removeAttr('title');
      $(this).html('Show');
    }
    return false;
  });

  $('.read .click-to-select').click(function() {
    var input = $(this).find('input');
    if (input.val())
      input.select();
    return false;
  });

  $('#add_account_btn').click(function() {
    Accounts.addBlankTile();
    return false;
  });

  $('a[data-cancel]').click(function() {
    var tile = $(this).closest('.account-tile');
    if (!tile.attr('data-account-id'))
      tile.remove();
    else
      Accounts.resetTile(tile);
    return false;
  });

  $('button[data-account-edit]').click(function() {
    var tile = $(this).closest('.account-tile');
    tile.find('.read').hide();
    tile.find('button[data-account-delete]').show();
    tile.find('.write').show();
    return false;
  });

  $('button[data-account-delete]').click(function() {
    if (!confirm('Are you sure you want to delete this account?'))
      return false;
    var tile = $(this).closest('.account-tile');
    var accounts = $.extend(true, {}, userData.accounts);
    delete accounts[tile.attr('data-account-id')];
    try {
      userData.setEncryptedData(accounts);
    } catch(err) {
      alert('Failed to encrypt accounts.');
      return false;
    }
    var form = tile.find('.update form');
    form.data('deletedAccount', 'true');
    form.submit();
    return false;
  });

  $('#account_tiles .write form').submit(function() {
    var tile = $(this).closest('.account-tile');
    var data = {
      'account': $(this).find('input.account').val(),
      'username': $(this).find('input.username').val(),
      'password': $(this).find('input.password').val(),
      'notes': $(this).find('textarea.notes').val()
    };
    var oldAccountId = tile.attr('data-account-id');
    var accountId = Crypto.sha256(data['account']);
    if (data['account'].length == 0) {
      alert('Account Name cannot be blank.');
      return false;
    } else if (oldAccountId != accountId && userData.accounts[accountId]) {
      alert('An account with that name already exists.');
      return false;
    }
    var accounts = $.extend(true, {}, userData.accounts);
    if (oldAccountId)
      delete accounts[oldAccountId];
    accounts[accountId] = data;
    try {
      userData.setEncryptedData(accounts);
    } catch(err) {
      alert('Failed to encrypt accounts.');
      return false;
    }
    var form = tile.find('.update form');
    form.data('deletedAccount', 'false');
    form.submit();
    return false;
  });

  $('#account_tiles .update form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    var tile = $(this).closest('.account-tile');
    if ($(this).data('deletedAccount') == 'true')
      Accounts.removeTile(tile);
    else
      Accounts.updateTile(tile);
  })
  .bind('ajax:error', function(evt, xhr) {
    alert(Util.extractErrors(xhr));
  })
  .bind('ajax:before', function() {
    $(this).find('input.api-key').val(userData.apiKey);
    $(this).find('input.encrypted-data').val(userData.encryptedData);
    $(this).find('input.schema-version').val(Schema.currentVersion);
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    var btns = $(this).closest('.account-tile').find('.write form .btn');
    btns.attr('disabled', 'disabled');
  })
  .bind('ajax:complete', function() {
    var btns = $(this).closest('.account-tile').find('.write form .btn');
    btns.removeAttr('disabled');
  });

  $('#reload_link').bind('ajax:success', function(evt, data) {
    Accounts.reload(data);
  })
  .bind('ajax:error', function() {
    alert('Failed to sync with server. Please try again.');
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    $(this).hide();
    $('#reload_spinner').show();
  })
  .bind('ajax:complete', function() {
    $('#reload_spinner').hide();
    $(this).show();
    Util.chooseSection();
  });

  $('#set_master_password_btn').click(function() {
    Configure.init();
    Util.displaySection('configure');
    return false;
  });

  $('#accounts_list_search').keyup(function() {
    Util.typewatch($(this).val(), 'Accounts.searchTiles(currentVal);', 250);
  });

  $('button[data-password-generator]').click(function() {
    $(this).parent().find('input.password').val(Passwords.generate(12, true));
    return false;
  });
});
