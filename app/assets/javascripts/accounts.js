function Accounts() {};

Accounts.init = function() {
  $('#accounts_email_placeholder').html(userData.email);
  this.selectView();
};

Accounts.selectView = function() {
  if (userData.masterPassword) {
    $('#unlock_accounts').hide();
    $('#accounts_list').show();
  } else {
    $('#accounts_list').hide();
    $('#unlock_accounts').show();
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
});
