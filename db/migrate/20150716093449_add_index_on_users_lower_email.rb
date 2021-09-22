class AddIndexOnUsersLowerEmail < ActiveRecord::Migration[4.2]
  disable_ddl_transaction!

  def up
    execute 'CREATE UNIQUE INDEX CONCURRENTLY index_users_on_lower_email ON users (LOWER(email))'
  end

  def down
    execute 'DROP INDEX CONCURRENTLY IF EXISTS index_users_on_lower_email'
  end
end
