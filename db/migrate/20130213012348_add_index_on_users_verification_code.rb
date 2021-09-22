class AddIndexOnUsersVerificationCode < ActiveRecord::Migration[4.2]
  def up
    add_index :users, :verification_code, :unique => true
  end

  def down
    remove_index :users, :verification_code
  end
end
