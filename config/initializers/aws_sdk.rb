credential_file = File.expand_path('../../../.aws_credentials.sh', __FILE__)
if File.exists?(credential_file)
  aws_credentials   = File.read(credential_file)
  access_key_id     = aws_credentials.scan(/AWSAccessKeyId=.+/).first.sub('AWSAccessKeyId=', '')
  secret_access_key = aws_credentials.scan(/AWSSecretKey=.+/).first.sub('AWSSecretKey=', '')
  AWS.config(:access_key_id => access_key_id, :secret_access_key => secret_access_key)
end
