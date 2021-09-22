class AddVersionCodeToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :version_code, :string
  end
end
