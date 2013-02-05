data = [
  'CACHE MANIFEST',
  'CACHE:',
  '/img/glyphicons-halflings.png',
  '/img/glyphicons-halflings-white.png',
  '/img/spinner.gif',
]
assets = [
  'application.css',
  'application.js',
]

if Rails.env.production?
  manifest = YAML.load_file("#{Rails.configuration.assets.manifest}/manifest.yml")
  data += assets.map { |asset| "#{Rails.configuration.assets.prefix}/#{manifest[asset]}" }
else
  data += assets.map { |asset| "#{Rails.configuration.assets.prefix}/#{asset}" }
end

CACHE_MANIFEST = (data + [ 'NETWORK:', '/' ]).join("\n")
