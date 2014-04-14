require File.expand_path('../../../config/initializers/aws_sdk', __FILE__)

namespace :assets do

  desc 'Precompiles assets and uploads them to S3'
  task :upload do
    unless %w(production).include?(Rails.env)
      puts "RAILS_ENV must be set to 'production'"
      next
    end
    File.write("#{Rails.root}/config/manifest.json", '{"files":{},"assets":{}}')
    Rake::Task['assets:precompile'].invoke
    bucket   = AWS::S3.new.buckets['passmaster']
    assets   = "#{Rails.root}/public/assets"
    uploaded = Set.new
    manifest = JSON.parse(File.read("#{Rails.root}/config/manifest.json"))
    manifest['files'].each do |filename, metadata|
      next if uploaded.include?(filename)
      object = bucket.objects["assets/#{filename}"]
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
        if File.exists?("#{assets}/#{filename}.gz")
          object.write(:file => "#{assets}/#{filename}.gz", :acl => :public_read, :content_type => content_type, :content_encoding => 'gzip')
        else
          object.write(:file => "#{assets}/#{filename}", :acl => :public_read, :content_type => content_type)
        end
        puts "Uploaded: #{filename}"
      end
      uploaded << filename
    end
    Rake::Task['assets:clobber'].invoke
  end

end
