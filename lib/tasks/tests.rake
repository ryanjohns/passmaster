namespace :test do

  desc 'Checks ruby, haml, and yaml files for syntax errors.'
  task :syntax do
    puts "# Checking syntax:", ''

    files = 0
    errors = []
    time = Benchmark.realtime do
      # ruby
      %w(app config db lib).each do |dir|
        Dir.glob("#{Rails.root}/#{dir}/**/*.rb").each do |file|
          files += 1
          output = `ruby -c #{file} 2>&1`
          if output =~ /syntax ok/i
            print '.'
          else
            errors << output
            print 'E'
          end
        end
      end

      # haml
      Dir.glob("#{Rails.root}/app/views/**/*.haml").each do |file|
        files += 1
        begin
          Haml::Engine.new(File.read(file))
          print '.'
        rescue Exception => e
          errors << "#{file}: #{e.message}"
          print 'E'
        end
      end

      # yaml
      %w(app config db lib).each do |dir|
        Dir.glob("#{Rails.root}/#{dir}/**/*.yml").each do |file|
          files += 1
          begin
            YAML.load_file(file)
            print '.'
          rescue Exception => e
            errors << e.message
            print 'E'
          end
        end
      end
    end

    puts '', '', "Finished in #{time}s, #{files / time} files/s.", ''
    errors.each_with_index { |e, i| puts "  #{i+1}) Error:", "#{e}", '' }
    puts "#{files} files, #{errors.size} errors"

    abort if errors.size > 0
  end

end
