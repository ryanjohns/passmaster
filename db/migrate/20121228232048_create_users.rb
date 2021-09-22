class CreateUsers < ActiveRecord::Migration[4.2]
  def change
    create_table :users, :id => false do |t|
      t.string :id, :primary => true, :null => false, :limit => 32
      t.string :verification_code, :null => false, :limit => 32
      t.string :email, :null => false
      t.text :api_key
      t.text :encrypted_data
      t.datetime :verified_at
      t.timestamps :null => false
    end

    add_index :users, :id, :unique => true
    add_index :users, :email, :unique => true
  end
end
