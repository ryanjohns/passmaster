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
  if (data['notes'].length == 0)
    tile.find('.read .notes').hide();
  else
    tile.find('.read .notes pre').html(data['notes']);
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
  tile.find('.read .account span').html(tile.find('.write .account input').val());
  tile.find('.read .username span').html(tile.find('.write .username input').val());
  tile.find('.read .password a').attr('data-password', tile.find('.write .password input').val());
  tile.find('.read .notes pre').html(tile.find('.write .notes textarea').val());
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

  $('a[data-edit]').click(function() {
    var tile = $(this).closest('.account-tile');
    tile.find('.read').hide();
    tile.find('.write').show();
    return false;
  });

  $('a[data-delete]').click(function() {
    $(this).closest('.account-tile').remove();
    return false;
  });

  $('#account_tiles form').submit(function() {
    return false;
  });
});
