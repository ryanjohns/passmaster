class ScopeClientIdUniqueness < ActiveRecord::Migration[4.2]
  def up
    remove_index :otp_sessions, :client_id
    remove_index :otp_sessions, [:user_id, :client_id]
    add_index :otp_sessions, :client_id
    add_index :otp_sessions, [:user_id, :client_id], :unique => true
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
