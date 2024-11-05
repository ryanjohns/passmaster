EMAIL_REGEX = /\A[A-Z0-9_\.%\+\-']+@(?:[A-Z0-9\-]+\.)+(?:[A-Z]{2,4}|museum|travel)\z/i

ENCRYPTED_DATA_SCHEMA_VERSION = 1

ACCOUNTS_VIEWER_FILENAME = 'accounts_viewer.html'
ACCOUNTS_VIEWER = File.read("#{Rails.root}/public/#{ACCOUNTS_VIEWER_FILENAME}")
BACKUP_PREFIX = 'Passmaster Backup'

CACHE_VERSION = 1730439900
CACHED_ASSETS = [
  'glyphicons-halflings.png',
  'glyphicons-halflings-white.png',
  'spinner.gif',
  'icon-32.png',
  'libraries.css',
  'libraries.js',
  'application.css',
  'application.js',
]

# To add support for a new language:
#   1. Add the 2-character code and translated name to LANGUAGE_NAMES below
#   2. Copy config/locales/en.yml to config/locales/<language_code>.yml
#   3. Add translations for all strings in in <language_code>.yml
LANGUAGE_NAMES = {
  'en' => 'English',
  'vi' => 'Tiếng Việt',
}
LANGUAGES = LANGUAGE_NAMES.keys
DEFAULT_LANGUAGE = 'en'
