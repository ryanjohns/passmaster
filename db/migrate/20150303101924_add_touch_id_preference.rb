class AddTouchIdPreference < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :touch_id_enabled, :boolean, :default => false
  end
end
