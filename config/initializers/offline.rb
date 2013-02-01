data   = [ 'CACHE MANIFEST' ]
assets = [
  'application.css',
  'application.js',
  'spinner.gif',
]
other  = [
  '/img/glyphicons-halflings.png',
  '/img/glyphicons-halflings-white.png',
]
if Rails.env.production?
  manifest = YAML.load_file("#{Rails.configuration.assets.manifest}/manifest.yml")
  data += assets.map { |asset| "#{ActionController::Base.asset_host}#{Rails.configuration.assets.prefix}/#{manifest[asset]}" }
  data += other.map  { |other| "#{ActionController::Base.asset_host}#{other}" }
else
  data += assets.map { |asset| "#{Rails.configuration.assets.prefix}/#{asset}" }
  data += other
end

data += [ 'NETWORK:', '/' ]

CACHE_MANIFEST = data.join("\n")
