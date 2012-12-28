require 'test_helper'

class UuidColumnsTest < ActiveSupport::TestCase

  setup :silence_migrations

  test "uuid" do
    ActiveRecord::Migration.create_table :test_table, :id => false do |t|
      t.uuid :test_column, :null => false, :default => 'test'
    end
    ActiveRecord::Base.table_name = :test_table
    assert ActiveRecord::Base.table_exists?
    column = ActiveRecord::Base.columns_hash['test_column']
    assert column.present?
    assert_equal 'char(32)', column.sql_type
    assert_equal false, column.null
    assert_equal 'test', column.default
    ActiveRecord::Migration.drop_table(:test_table)
  end

  test "add_uuid_column" do
    ActiveRecord::Migration.add_uuid_column :schema_migrations, :test_column, :null => false, :default => 'test'
    ActiveRecord::Base.table_name = :schema_migrations
    column = ActiveRecord::Base.columns_hash['test_column']
    assert column.present?
    assert_equal 'char(32)', column.sql_type
    assert_equal false, column.null
    assert_equal 'test', column.default
    ActiveRecord::Migration.remove_column :schema_migrations, :test_column
  end

  private

  def silence_migrations
    ActiveRecord::Migration.verbose = false
  end

end
