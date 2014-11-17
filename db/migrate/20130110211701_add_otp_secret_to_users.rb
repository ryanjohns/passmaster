class AddOtpSecretToUsers < ActiveRecord::Migration
  def change
    add_column :users, :otp_secret, :string, :limit => 16
  end
end
