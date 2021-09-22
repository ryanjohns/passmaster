class AddPreferenceFieldsToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :password_length, :integer, :null => false, :default => 20
    add_column :users, :idle_timeout, :integer, :null => false, :default => 5
  end
end
