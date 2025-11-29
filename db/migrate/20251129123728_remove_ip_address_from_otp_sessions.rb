class RemoveIpAddressFromOtpSessions < ActiveRecord::Migration[8.0]
  def change
    remove_column :otp_sessions, :ip_address, :string
  end
end
