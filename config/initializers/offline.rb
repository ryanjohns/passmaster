CACHE_MANIFEST = Rack::Offline.configure({ :cache => Rails.env.production?, :root => Rails.public_path }) do
  manifest = "#{Rails.public_path}/assets/manifest.yml"
  if Rails.env.production? && File.exists?(manifest)
    assets = YAML.load_file(manifest)
    cache "/assets/#{assets['application.css']}"
    cache "/assets/#{assets['application.js']}"
  else
    cache '/assets/application.css'
    cache '/assets/application.js'
  end
  cache '/img/glyphicons-halflings.png'
  cache '/img/glyphicons-halflings-white.png'
  cache '/img/spinner.gif'

  network '/'
end
