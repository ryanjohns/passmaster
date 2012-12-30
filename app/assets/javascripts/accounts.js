function Accounts() {};

Accounts.init = function() {
  $('#accounts_email_placeholder').html(userData.email);
  this.selectView();
};

Accounts.selectView = function() {
  if (userData.masterPassword) {
    this.fillAccountsTable();
    $('#unlock_accounts').hide();
    $('#accounts_list').show();
  } else {
    $('#accounts_list').hide();
    $('#unlock_accounts').show();
  }
};

Accounts.fillAccountsTable = function() {
  $('#account_tiles .account-data').remove();
  for (account in userData.accounts) {
    var tile = $('#account_tiles .template').clone(true);
    tile.find('.account span').html(account);
    tile.find('.username span').html(userData.accounts[account]['username']);
    tile.find('.password a').attr('data-password', userData.accounts[account]['password']);
    var notes = userData.accounts[account]['notes'];
    if (notes.length == 0)
      tile.find('.notes').hide();
    else
      tile.find('.notes pre').html(notes);
    tile.removeClass('template');
    tile.addClass('account-data');
    tile.appendTo('#account_tiles');
    tile.removeAttr('style');
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
});
