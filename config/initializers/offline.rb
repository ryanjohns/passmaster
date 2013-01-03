APPLICATION_MANIFEST = Rack::Offline.configure({ :cache => Rails.env.production?, :root => Rails.public_path }) do
  if Rails.env.production?
    manifest = YAML.load_file("#{Rails.public_path}/assets/manifest.yml") rescue {}
    cache "/assets/#{manifest['application.css']}"
    cache "/assets/#{manifest['application.js']}"
  else
    cache '/assets/application.css'
    cache '/assets/application.js'
  end
  network '/'
end
