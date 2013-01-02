class AddSchemaVersionToUsers < ActiveRecord::Migration
  def change
    add_column :users, :schema_version, :integer, :null => false, :default => 0
  end
end
