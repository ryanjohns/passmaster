function Accounts() {};

Accounts.init = function() {
  $('#accounts_email_placeholder').html(userData.email);
  this.selectView();
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
  $('#account_tiles .account-data').remove();
  for (account in userData.accounts)
    this.addAccountTile(account, userData.accounts[account]);
};

Accounts.addAccountTile = function(account, data) {
  var tile = $('#account_tiles .template').clone(true);
  tile.find('.read .account span').html(account);
  tile.find('.read .username span').html(data['username']);
  tile.find('.read .password a').attr('data-password', data['password']);
  tile.find('.read .notes pre').html(data['notes']);
  if (data['notes'].length == 0)
    tile.find('.read .notes').hide();
  tile.find('.write .account input').val(account);
  tile.find('.write .username input').val(data['username']);
  tile.find('.write .password input').val(data['password']);
  tile.find('.write .notes textarea').val(data['notes']);
  tile.find('.write').hide();
  tile.removeClass('template');
  tile.addClass('account-data');
  tile.appendTo('#account_tiles');
  tile.removeAttr('style');
};

Accounts.addBlankTile = function() {
  var tile = $('#account_tiles .template').clone(true);
  tile.find('.read').hide();
  tile.removeClass('template');
  tile.addClass('account-data');
  tile.prependTo('#account_tiles');
  tile.removeAttr('style');
};

Accounts.resetTile = function(tile) {
  tile.find('.write .account input').val(tile.find('.read .account span').html());
  tile.find('.write .username input').val(tile.find('.read .username span').html());
  tile.find('.write .password input').val(tile.find('.read .password a').attr('data-password'));
  tile.find('.write .notes textarea').val(tile.find('.read .notes pre').html());
  tile.find('.write').hide();
  tile.find('.read').show();
};

Accounts.updateTile = function(tile) {
  var account = tile.find('.write .account input').val();
  var data = {
    'username': tile.find('.write .username input').val(),
    'password': tile.find('.write .password input').val(),
    'notes': tile.find('.write .notes textarea').val()
  };
  userData.accounts[account] = data;
  tile.find('.read .account span').html(account);
  tile.find('.read .username span').html(data['username']);
  tile.find('.read .password a').attr('data-password', data['password']);
  tile.find('.read .notes pre').html(data['notes']);
  if (data['notes'].length == 0)
    tile.find('.read .notes').hide();
  else
    tile.find('.read .notes').show();
  tile.find('.write').hide();
  tile.find('.read').show();
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
  this.selectView();
};

$(function() {
  $('#unlock_accounts_form').submit(function() {
    var passwd = $('#unlock_accounts_field').val();
    if (passwd.length == 0)
      alert('Bad password.');
    else
      Accounts.unlock(passwd);
    return false;
  });

  $('a[data-password]').click(function() {
    var span = $(this).parent().find('span');
    if (span.html() == '') {
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
    if (tile.find('.read .account span').html() == '')
      tile.remove();
    else
      Accounts.resetTile(tile);
    return false;
  });

  $('a[data-account-edit]').click(function() {
    var tile = $(this).closest('.account-tile');
    tile.find('.read').hide();
    tile.find('.write').show();
    return false;
  });

  $('a[data-account-delete]').click(function() {
    if (!confirm('Are you sure you want to delete this account?'))
      return false;
    var tile = $(this).closest('.account-tile');
    var account = tile.find('.read .account span').html();
    var accounts = $.extend(true, {}, userData.accounts);
    delete accounts[account];
    userData.setEncryptedData(accounts);
    var form = tile.find('.update form');
    form.data('deleted-account', 'true');
    form.find('input.api-key').val(userData.apiKey);
    form.find('input.encrypted-data').val(userData.encryptedData);
    form.submit();
    return false;
  });

  $('#account_tiles .write form').submit(function() {
    var tile = $(this).closest('.account-tile');
    var account = $(this).find('.account input').val();
    var data = {
      'username': $(this).find('.username input').val(),
      'password': $(this).find('.password input').val(),
      'notes': $(this).find('.notes textarea').val()
    };
    if (account.length == 0) {
      alert('Account Name cannot be blank.');
      return false;
    } else if (tile.find('.read .account span').html() == '' && userData.accounts[account]) {
      alert('An account with that name already exists.');
      return false;
    }
    var accounts = $.extend(true, {}, userData.accounts);
    accounts[account] = data;
    userData.setEncryptedData(accounts);
    var form = tile.find('.update form');
    form.data('deleted-account', 'false');
    form.find('input.api-key').val(userData.apiKey);
    form.find('input.encrypted-data').val(userData.encryptedData);
    form.submit();
    return false;
  });

  $('#account_tiles .update form').bind('ajax:success', function(evt, data, status, xhr) {
    var tile = $(this).closest('.account-tile');
    if ($(this).data('deleted-account') == 'true')
      tile.remove();
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
});
