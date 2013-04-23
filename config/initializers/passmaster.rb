require 'extensions'

EMAIL_REGEX = /\A[A-Z0-9_\.%\+\-']+@(?:[A-Z0-9\-]+\.)+(?:[A-Z]{2,4}|museum|travel)\z/i

ENCRYPTED_DATA_SCHEMA_VERSION = 1

ACCOUNTS_VIEWER = File.read("#{Rails.root}/public/accounts_viewer.html")
