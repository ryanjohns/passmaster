namespace :assets do

  desc 'Precompiles assets and uploads them to S3'
  task :upload do
    Rake::Task['assets:precompile'].invoke
    AWS.config(YAML.load(File.read("#{Rails.root}/config/aws.yml"))[Rails.env])
    bucket   = AWS::S3.new.buckets['passmaster']
    assets   = "#{Rails.root}/public/assets"
    uploaded = Set.new
    File.open("#{Rails.root}/config/manifest.yml") do |f|
      f.readline
      f.each_line do |line|
        filename = line.split.last
        if uploaded.include?(filename) || filename =~ /\.map$/
          next
        else
          uploaded << filename
        end
        object = bucket.objects["assets/#{filename}"]
        if object.exists?
          puts "Exists: #{filename}"
        else
          content_type = 'text/plain'
          content_type = 'text/css' if filename =~ /\.css$/
          content_type = 'application/javascript' if filename =~ /\.js$/
          content_type = 'image/jpeg' if filename =~ /\.(jpg|jpeg)$/
          content_type = 'image/png' if filename =~ /\.png$/
          content_type = 'image/gif' if filename =~ /\.gif$/
          object.write(:file => "#{assets}/#{filename}", :acl => :public_read, :content_type => content_type)
          puts "Uploaded: #{filename}"
        end
      end
    end
    Rake::Task['assets:clean'].invoke
  end

  desc 'Cleans old assets from S3'
  task :clean_s3 do
    puts 'Are you sure you want to do this? Some old assets could still be in use by out-of-date clients. [y/N]'
    answer = STDIN.gets
    exit 1 unless answer =~ /^(y|yes)$/i
    AWS.config(YAML.load(File.read("#{Rails.root}/config/aws.yml"))[Rails.env])
    bucket         = AWS::S3.new.buckets['passmaster']
    current_assets = Set.new
    File.open("#{Rails.root}/config/manifest.yml") do |f|
      f.readline
      f.each_line do |line|
        filename = line.split.last
        current_assets << "assets/#{filename}" unless filename =~ /\.map$/
      end
    end
    bucket.objects.with_prefix('assets/').each do |obj|
      if current_assets.include?(obj.key)
        puts "Kept: #{obj.key}"
      else
        obj.delete
        puts "Deleted: #{obj.key}"
      end
    end
  end

end
