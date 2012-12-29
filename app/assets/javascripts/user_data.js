var userData = null;

function UserData(data) {
  this.userId = data['id'];
  this.email = data['email'];
  this.verified = data['verified_at?'];
  this.encryptedData = data['encrypted_data'];
  this.accounts = {};

  localStorage.email = this.email;

  this.setMasterPassword = function(passwd) {
    this.masterPassword = Crypto.sha256(passwd);
    this.apiKey = Crypto.sha256(this.masterPassword + ':' + this.userId);
  };
  this.decryptAccounts = function() {
    if (this.encryptedData != null)
      this.accounts = Crypto.decryptObject(this.masterPassword, this.encryptedData);
  };
  this.encryptAccounts = function() {
    this.encryptedData = Crypto.encryptObject(this.masterPassword, this.accounts);
  };
};
