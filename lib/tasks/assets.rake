namespace :assets do

  desc 'Precompiles assets and uploads them to S3'
  task :upload do
    unless ENV['AWS_CREDENTIAL_FILE'] && File.exists?(ENV['AWS_CREDENTIAL_FILE'])
      puts 'Could not find AWS credentials. Make sure they are in the file specified by the AWS_CREDENTIAL_FILE environment variable.'
      return
    end
    aws_credentials   = File.read(ENV['AWS_CREDENTIAL_FILE'])
    access_key_id     = aws_credentials.scan(/AWSAccessKeyId=.+/).first.sub('AWSAccessKeyId=', '')
    secret_access_key = aws_credentials.scan(/AWSSecretKey=.+/).first.sub('AWSSecretKey=', '')
    AWS.config(:access_key_id => access_key_id, :secret_access_key => secret_access_key)
    Rake::Task['assets:precompile'].invoke
    bucket   = AWS::S3.new.buckets['passmaster']
    assets   = "#{Rails.root}/public/assets"
    uploaded = Set.new
    File.open("#{Rails.root}/config/manifest.yml") do |f|
      f.readline
      f.each_line do |line|
        filename = line.split.last
        next if uploaded.include?(filename) || filename =~ /\.map$/
        object = bucket.objects["assets/#{filename}"]
        obj_gz = bucket.objects["assets/#{filename}.gz"]
        if object.exists? && obj_gz.exists?
          puts "Exists: #{filename}"
          puts "Exists: #{filename}.gz"
        else
          content_type = 'text/plain'
          content_type = 'text/css'                 if filename =~ /\.css$/
          content_type = 'image/jpeg'               if filename =~ /\.(jpg|jpeg)$/
          content_type = 'image/png'                if filename =~ /\.png$/
          content_type = 'image/gif'                if filename =~ /\.gif$/
          content_type = 'application/x-javascript' if filename =~ /\.js$/
          object.write(:file => "#{assets}/#{filename}", :acl => :public_read, :content_type => content_type)
          obj_gz.write(:file => "#{assets}/#{filename}.gz", :acl => :public_read, :content_type => content_type, :content_encoding => 'gzip')
          puts "Uploaded: #{filename}"
          puts "Uploaded: #{filename}.gz"
        end
        uploaded << filename
      end
    end
    Rake::Task['assets:clean'].invoke
  end

end
