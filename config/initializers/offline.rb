data = [
  'CACHE MANIFEST',
  'CACHE:',
  '/img/glyphicons-halflings.png',
  '/img/glyphicons-halflings-white.png',
  '/img/spinner.gif',
  '/img/combination-32.png',
]
assets = [
  'application.css',
  'application.js',
]

if Rails.env.production?
  manifest = JSON.parse(File.read("#{Rails.configuration.assets.manifest}/manifest.json"))
  data += assets.map { |asset| "#{Rails.configuration.assets.prefix}/#{manifest['assets'][asset]}" }
else
  data += assets.map { |asset| "#{Rails.configuration.assets.prefix}/#{asset}" }
end

CACHE_MANIFEST = (data + [ 'NETWORK:', '/' ]).join("\n")
