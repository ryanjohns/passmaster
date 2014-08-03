env_file = File.expand_path('../../env.local.yml', __FILE__)
env_file = File.expand_path('../../env.yml', __FILE__) unless File.file?(env_file)

if File.file?(env_file)
  YAML.load_file(env_file).each do |env, vars|
    vars.each do |k, v|
      ENV["#{env.upcase}_#{k.upcase}"] = v.to_s
    end
  end
end
