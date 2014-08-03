require 'yaml'

env_file = File.expand_path('../../env.local.yml', __FILE__)
env_file = File.expand_path('../../env.yml', __FILE__) unless File.file?(env_file)

if File.file?(env_file)
  YAML.load_file(env_file).each do |key, vars|
    if vars.is_a?(Hash)
      vars.each do |k, v|
        ENV["#{key.upcase}_#{k.upcase}"] = v.to_s
      end
    else
      ENV[key.upcase] = vars.to_s
    end
  end
end
