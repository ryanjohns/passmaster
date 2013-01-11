class AddOtpSecretToUsers < ActiveRecord::Migration
  def change
    add_column :users, :otp_secret, 'char(16) binary'
  end
end
