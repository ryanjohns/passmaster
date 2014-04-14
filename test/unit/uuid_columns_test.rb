require 'test_helper'

class UuidColumnsTest < ActiveSupport::TestCase

  setup :silence_migrations

  test "uuid" do
    ActiveRecord::Base.connection.execute('DROP TABLE IF EXISTS test_table')
    ActiveRecord::Migration.create_table :test_table, :id => false do |t|
      t.uuid :test_column, :null => false, :default => 'test'
    end
    columns = ActiveRecord::Base.connection.select_rows('DESC test_table')
    assert_equal 1, columns.size
    column = columns.first
    assert_equal 'test_column', column[0]
    assert_equal 'char(32)', column[1]
    assert_equal 'NO', column[2]
    assert_equal 'test', column[4]
    ActiveRecord::Migration.drop_table(:test_table)
  end

  test "add_uuid_column" do
    ActiveRecord::Base.connection.execute('DROP TABLE IF EXISTS test_table')
    ActiveRecord::Migration.create_table :test_table
    ActiveRecord::Migration.add_uuid_column :test_table, :test_column, :null => false, :default => 'test'
    columns = ActiveRecord::Base.connection.select_rows('DESC test_table')
    assert_equal 2, columns.size
    assert_equal 'id', columns.first[0]
    column = columns.last
    assert_equal 'test_column', column[0]
    assert_equal 'char(32)', column[1]
    assert_equal 'NO', column[2]
    assert_equal 'test', column[4]
    ActiveRecord::Migration.drop_table(:test_table)
  end

  private

  def silence_migrations
    ActiveRecord::Migration.verbose = false
  end

end
