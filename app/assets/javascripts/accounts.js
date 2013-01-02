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
      console.log(err.toString());
      alert('Failed to decrypt accounts.');
    }
  }
  Util.chooseSection();
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
  tile.find('.read .account span').html(data['account']);
  tile.find('.read .username span').html(data['username']);
  tile.find('.read .password a').attr('data-password', data['password']);
  tile.find('.read .notes pre').html(data['notes']);
  if (data['notes'].length == 0)
    tile.find('.read .notes').hide();
  tile.find('.write .account input').val(data['account']);
  tile.find('.write .username input').val(data['username']);
  tile.find('.write .password input').val(data['password']);
  tile.find('.write .notes textarea').val(data['notes']);
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
  tile.find('.read .account span').html(data['account']);
  tile.find('.read .username span').html(data['username']);
  tile.find('.read .password a').attr('data-password', data['password']);
  tile.find('.read .password a').html('show');
  tile.find('.read .password span').html('');
  tile.find('.read .notes pre').html(data['notes']);
  tile.find('.write .account input').val(data['account']);
  tile.find('.write .username input').val(data['username']);
  tile.find('.write .password input').val(data['password']);
  tile.find('.write .notes textarea').val(data['notes']);
  tile.find('.write').hide();
  tile.find('.read').show();
};

Accounts.updateTile = function(tile) {
  var accountId = tile.attr('data-account-id');
  if (accountId)
    delete userData.accounts[accountId];
  var data = {
    'account': tile.find('.write .account input').val(),
    'username': tile.find('.write .username input').val(),
    'password': tile.find('.write .password input').val(),
    'notes': tile.find('.write .notes textarea').val()
  };
  accountId = Crypto.sha256(data['account']);
  userData.accounts[accountId] = data;
  tile.attr('data-account-id', accountId);
  tile.find('.read .account span').html(data['account']);
  tile.find('.read .username span').html(data['username']);
  tile.find('.read .password a').attr('data-password', data['password']);
  tile.find('.read .password a').html('show');
  tile.find('.read .password span').html('');
  tile.find('.read .notes pre').html(data['notes']);
  if (data['notes'].length == 0)
    tile.find('.read .notes').hide();
  else
    tile.find('.read .notes').show();
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
    console.log(err.toString());
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

  $('a[data-password]').click(function() {
    var span = $(this).parent().find('span');
    if ($(this).html() == 'show') {
      span.html($(this).attr('data-password'));
      $(this).html('hide');
    } else {
      span.html('');
      $(this).html('show');
    }
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
      console.log(err.toString());
      alert('Failed to encrypt accounts.');
      return false;
    }
    var form = tile.find('.update form');
    form.data('deletedAccount', 'true');
    form.find('input.api-key').val(userData.apiKey);
    form.find('input.encrypted-data').val(userData.encryptedData);
    form.submit();
    return false;
  });

  $('#account_tiles .write form').submit(function() {
    var tile = $(this).closest('.account-tile');
    var data = {
      'account': $(this).find('.account input').val(),
      'username': $(this).find('.username input').val(),
      'password': $(this).find('.password input').val(),
      'notes': $(this).find('.notes textarea').val()
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
      console.log(err.toString());
      alert('Failed to encrypt accounts.');
      return false;
    }
    var form = tile.find('.update form');
    form.data('deletedAccount', 'false');
    form.find('input.api-key').val(userData.apiKey);
    form.find('input.encrypted-data').val(userData.encryptedData);
    form.submit();
    return false;
  });

  $('#account_tiles .update form').bind('ajax:success', function(evt, data, status, xhr) {
    userData.updateAttributes(data);
    var tile = $(this).closest('.account-tile');
    if ($(this).data('deletedAccount') == 'true')
      Accounts.removeTile(tile);
    else
      Accounts.updateTile(tile);
  })
  .bind('ajax:error', function(evt, xhr, status, error) {
    alert(Util.extractErrors(xhr));
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    var btns = $(this).closest('.account-tile').find('.write form .btn');
    btns.attr('disabled', 'disabled');
  })
  .bind('ajax:complete', function(evt, xhr, status) {
    var btns = $(this).closest('.account-tile').find('.write form .btn');
    btns.removeAttr('disabled');
  });

  $('#reload_link').bind('ajax:success', function(evt, data, status, xhr) {
    Accounts.reload(data);
  })
  .bind('ajax:error', function(evt, xhr, status, error) {
    console.log(Util.extractErrors(xhr));
    Util.enableReadOnly();
    Util.chooseSection();
    alert('Failed to sync with server. Read-only mode enabled to protect data loss.');
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    $(this).hide();
    $('#reload_spinner').show();
  })
  .bind('ajax:complete', function(evt, xhr, status) {
    $('#reload_spinner').hide();
    $(this).show();
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
    $(this).parent().find('input').val(Passwords.generate(12, true));
    return false;
  });
});
