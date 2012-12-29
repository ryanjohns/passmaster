class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users, :id => false do |t|
      t.uuid :id, :primary => true, :null => false
      t.uuid :verification_code, :null => false
      t.string :email, :null => false
      t.text :api_key
      t.text :encrypted_data, :limit => 4294967295
      t.datetime :verified_at
      t.timestamps
    end

    add_index :users, :id, :unique => true
    add_index :users, :email, :unique => true
  end
end
