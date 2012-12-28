module UuidColumns

  module TableDefinitionHelpers
    def uuid(*args)
      options = args.extract_options!
      column(args.first, 'char(32) binary', options)
    end
  end

  module MigrationHelpers
    def add_uuid_column(*args)
      options = args.extract_options!
      add_column(args.first, args.second, 'char(32) binary', options)
    end
  end

end

class ActiveRecord::ConnectionAdapters::TableDefinition; include UuidColumns::TableDefinitionHelpers; end
class ActiveRecord::Migration; extend UuidColumns::MigrationHelpers; end
