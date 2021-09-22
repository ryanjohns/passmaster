class AddSpecialCharsAndAutoBackupToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :special_chars, :boolean, :null => false, :default => true
    add_column :users, :auto_backup, :boolean, :null => false, :default => false
  end
end
