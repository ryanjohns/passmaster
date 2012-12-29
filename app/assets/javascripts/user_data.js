var userData = null;

function UserData(data) {
  this.user_id = data['id'];
  this.email = data['email'];
  this.verified = data['verified_at?'];
  this.encrypted_data = data['encrypted_data'];
};
