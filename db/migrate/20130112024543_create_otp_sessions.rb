class CreateOtpSessions < ActiveRecord::Migration
  def change
    create_table :otp_sessions, :id => false do |t|
      t.uuid :id, :primary => true, :null => false
      t.uuid :user_id, :null => false
      t.uuid :client_id, :null => false
      t.integer :login_count, :null => false, :default => 0
      t.integer :failed_count, :null => false, :default => 0
      t.string :ip_address
      t.text :user_agent
      t.datetime :activated_at
      t.datetime :last_seen_at
      t.timestamps :null => false
    end

    add_index :otp_sessions, :id, :unique => true
    add_index :otp_sessions, :client_id, :unique => true
    add_index :otp_sessions, [ :user_id, :client_id ]
    add_index :otp_sessions, :activated_at
  end
end
