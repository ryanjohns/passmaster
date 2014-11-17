class CreateOtpSessions < ActiveRecord::Migration
  def change
    create_table :otp_sessions, :id => false do |t|
      t.string :id, :primary => true, :null => false, :limit => 32
      t.string :user_id, :null => false, :limit => 32
      t.string :client_id, :null => false, :limit => 32
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
