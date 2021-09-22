class AddSchemaVersionToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :schema_version, :integer, :null => false, :default => 0
  end
end
