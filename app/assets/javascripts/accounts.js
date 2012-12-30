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
  $('#accounts_table tr.account-data').remove();
  for (account in userData.accounts) {
    var row = $('#accounts_table tr.template').clone(true);
    row.find('td.account').html(account);
    row.find('td.username').html(userData.accounts[account]['username']);
    row.find('a[data-password]').attr('data-password', userData.accounts[account]['password']);
    row.find('td.notes').html(userData.accounts[account]['notes']);
    row.removeClass('template');
    row.addClass('account-data');
    row.appendTo('#accounts_table tbody');
    row.removeAttr('style');
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
    var span = $(this).parent().find('span.password');
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
