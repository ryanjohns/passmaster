namespace :assets do

  desc 'Precompiles assets and uploads them to S3'
  task :upload do
    if Rails.env != 'production'
      puts "RAILS_ENV must be set to 'production'"
      next
    end
    Rake::Task['assets:precompile'].invoke
    assets   = "#{Rails.root}/public/assets"
    uploaded = Set.new
    manifest = JSON.parse(File.read("#{Rails.root}/config/manifest.json"))
    options  = {
      :bucket        => Rails.application.credentials.assets.aws_bucket!,
      :acl           => 'public-read',
      :cache_control => 'public, no-transform, max-age=31557600',
    }
    client   = Aws::S3::Client.new({
      :region      => ENV['AWS_REGION'],
      :credentials => Aws::Credentials.new(Rails.application.credentials.assets.aws_access_key_id!, Rails.application.credentials.assets.aws_secret_access_key!),
    })
    manifest['files'].each do |filename, _|
      next if uploaded.include?(filename) || !File.exist?("#{assets}/#{filename}")
      object = Aws::S3::Object.new(:bucket_name => options[:bucket], :key => "assets/#{filename}", :client => client)
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
          client.put_object(options.merge({ :key => object.key, :body => File.new("#{assets}/#{filename}.gz"), :content_type => content_type, :content_encoding => 'gzip' }))
        else
          client.put_object(options.merge({ :key => object.key, :body => File.new("#{assets}/#{filename}"), :content_type => content_type }))
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
