namespace :assets do

  desc 'Precompiles assets and uploads them to S3'
  task :upload do
    if Rails.env != 'production'
      puts "RAILS_ENV must be set to 'production'"
      next
    end
    Rake::Task['assets:precompile'].invoke
    bucket   = Aws::S3::Resource.new.bucket(ENV['AWS_ASSETS_BUCKET'])
    assets   = "#{Rails.root}/public/assets"
    uploaded = Set.new
    manifest = JSON.parse(File.read("#{Rails.root}/config/manifest.json"))
    options  = {
      :bucket        => ENV['AWS_ASSETS_BUCKET'],
      :acl           => 'public-read',
      :cache_control => 'public, no-transform, max-age=31557600',
    }
    manifest['files'].each do |filename, _|
      next if uploaded.include?(filename) || !File.exist?("#{assets}/#{filename}")
      object = bucket.object("assets/#{filename}")
      if object.exists?
        puts "Exists: #{filename}"
      else
        content_type = 'application/octet-stream'
        content_type = 'text/css'               if filename =~ /\.css$/
        content_type = 'image/jpeg'             if filename =~ /\.(jpg|jpeg)$/
        content_type = 'image/png'              if filename =~ /\.png$/
        content_type = 'image/gif'              if filename =~ /\.gif$/
        content_type = 'application/javascript' if filename =~ /\.js$/
        content_type = 'text/plain'             if filename =~ /\.txt$/
        if File.exist?("#{assets}/#{filename}.gz")
          object.client.put_object(options.merge({ :key => object.key, :body => File.new("#{assets}/#{filename}.gz"), :content_type => content_type, :content_encoding => 'gzip' }))
        else
          object.client.put_object(options.merge({ :key => object.key, :body => File.new("#{assets}/#{filename}"), :content_type => content_type }))
        end
        puts "Uploaded: #{filename}"
      end
      uploaded << filename
    end
    Rake::Task['assets:clobber'].invoke
  end

  desc 'Verifies the production assets match the locally compiled assets'
  task :verify do
    if Rails.env != 'production'
      puts "RAILS_ENV must be set to 'production'"
      next
    end
    assets  = []
    results = {}
    begin
      response = Net::HTTP.get_response(URI('https://passmaster.io'))
      document = Nokogiri::HTML(response.body.encode('UTF-8', 'binary', :invalid => :replace, :undef => :replace, :replace => ''))
      assets  += document.css('head link').collect   { |node| node['href'] }
      assets  += document.css('head script').collect { |node| node['src'] }
    rescue => e
      puts "Failed looking up production assets - #{e.message}"
      next
    end
    Rake::Task['assets:precompile'].invoke
    assets.each do |asset|
      remote_path    = "https://passmaster.io#{asset}"
      remote_hash    = `curl -s #{remote_path} | gunzip -c | shasum`.split.first
      local_path     = "#{Rails.root}/public#{asset}"
      local_hash     = File.exist?(local_path) ? `shasum #{local_path}`.split.first : 'not found'
      results[asset] = { :local_hash => local_hash, :remote_hash => remote_hash, :match => local_hash == remote_hash }
    end
    Rake::Task['assets:clobber'].invoke
    `git checkout #{Rails.root}/config/manifest.json`
    results.each do |asset, result|
      puts "#{asset}:"
      puts "    local hash:   #{result[:local_hash]}"
      puts "    remote hash:  #{result[:remote_hash]}"
      puts "    hashes match: #{result[:match] ? 'YES' : 'NO'}"
    end
    if results.all? { |_, result| result[:match] }
      puts "\nAll assets match!"
    else
      puts "\nMismatch detected!"
    end
  end

end
