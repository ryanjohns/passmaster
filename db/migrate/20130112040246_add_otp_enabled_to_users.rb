class AddOtpEnabledToUsers < ActiveRecord::Migration
  def change
    add_column :users, :otp_enabled, :boolean, :null => false, :default => false
  end
end
