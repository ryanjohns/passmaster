namespace :syntax do

  desc 'Checks ruby, haml, and yaml files for syntax errors.'
  task :check do
    valid = true
    # ruby
    %w(app config db lib).each do |dir|
      Dir.glob("#{Rails.root}/#{dir}/**/*.rb").each do |file|
        output = `ruby -c #{file} 2>&1`
        if output !~ /syntax ok/i
          valid = false
          puts output
        end
      end
    end

    # haml
    Dir.glob("#{Rails.root}/app/views/**/*.haml").each do |file|
      begin
        Haml::Engine.new(File.read(file))
      rescue Exception => e
        valid = false
        puts "#{file}: #{e.message}"
      end
    end

    # yaml
    %w(app config db lib).each do |dir|
      Dir.glob("#{Rails.root}/#{dir}/**/*.yml").each do |file|
        begin
          YAML.load_file(file)
        rescue Exception => e
          valid = false
          puts e.message
        end
      end
    end

    exit valid
  end

end
