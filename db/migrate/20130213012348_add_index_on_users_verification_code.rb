class AddIndexOnUsersVerificationCode < ActiveRecord::Migration
  def up
    add_index :users, :verification_code, :unique => true
  end

  def down
    remove_index :users, :verification_code
  end
end
