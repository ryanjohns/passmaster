APPLICATION_MANIFEST = Rack::Offline.configure do
  cache "#{Rails.configuration.assets[:prefix]}/application.js"
  cache "#{Rails.configuration.assets[:prefix]}/application.css"
  network '/'
end
