class AddVersionCodeToUsers < ActiveRecord::Migration
  def change
    add_column :users, :version_code, :string
  end
end
