env_file = File.expand_path('../../env.local.yml', __FILE__)
raise "#{env_file} is missing!" unless File.file?(env_file)

YAML.load_file(env_file).each do |key, vars|
  if vars.is_a?(Hash)
    vars.each do |k, v|
      ENV["#{key.upcase}_#{k.upcase}"] = v.to_s unless v.to_s == ''
    end
  else
    ENV[key.upcase] = vars.to_s unless vars.to_s == ''
  end
end
