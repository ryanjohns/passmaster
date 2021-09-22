class AddOtpSecretToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :otp_secret, :string, :limit => 16
  end
end
