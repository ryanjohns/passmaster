class AddTouchIdPreference < ActiveRecord::Migration
  def change
    add_column :users, :touch_id_enabled, :boolean, :default => false
  end
end
