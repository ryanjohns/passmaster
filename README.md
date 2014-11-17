## Passmaster

Host-Proof password storage using client-side AES-256 encryption. You can see
it live at <https://passmaster.io>.

## Running the server

This project is tested to run on ruby 2.1.4 so you should have that version
installed before starting. Using [RVM](https://rvm.io/) is highly recommended and .ruby-version
and .ruby-gemset files are in the project root for keeping your gems organized.
You will also need a variant of PostgreSQL 9.3 (9.2 and 9.1 should also work).

 * Fork and clone the repository
 * Create and modify env.local.yml (`cp config/env.yml config/env.local.yml`)
 * Install required gems (`bundle install`)
 * Create and migrate the database (`bundle exec rake db:create db:migrate`)
 * Start the server (`bundle exec script/unicorn start`)
 * Browse to http://localhost:8000

## Verifying javascript

If you would like to verify that the javascript at passmaster.io has not been
tainted you can do so fairly easily but it does require setting up a development
environment similar to what you would need to work on the project.

You will also need to view the source of passmaster.io from your browser and get the
link to the javascript assets. It will be in the document head and look like
'/assets/application-[digest].js'. You will need this URL (and it's digest) when
verifying the digests below. You can use whatever hashing command you prefer. This
example uses `shasum` but `md5` would also work just as well.

 * Clone the repository (`git clone git@github.com:ryanjohns/passmaster.git`)
 * Check out the production branch (`git checkout production`)
 * Install required gems (`bundle install`)
 * Compile the assets (`RAILS_ENV=production bundle exec rake assets:precompile`)
 * Compute hash of compiled asset (`shasum public/assets/application-[digest from above].js`)
 * Compute hash of server asset (`curl -s https://passmaster.io/assets/application-[digest from above].js | gunzip -c | shasum`)
 * The two hashes should match

## Mobile apps

The mobile apps are simple front-ends for passmaster.io that allow native
access to the clipboard for one-tap copy functionality.

 * [Google Play Store](https://play.google.com/store/apps/details?id=io.passmaster.Passmaster) - <https://github.com/ryanjohns/PassmasterAndroid>
 * [Apple App Store](https://itunes.apple.com/us/app/passmaster/id615271561?mt=8) - <https://github.com/ryanjohns/PassmasterIOS>

## Contributing

You are welcome to submit patches with bug fixes or feature additions. Please
make sure to test your changes throughly and keep to the style you see throughout
the rest of the code base. Indent with 2 spaces and no trailing spaces at the end
of lines. Just follow the steps below.

1. Fork and clone the repository
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a Pull Request

## Links

* Code: `git clone git@github.com:ryanjohns/passmaster.git`
* Home: <https://github.com/ryanjohns/passmaster>
* Bugs: <https://github.com/ryanjohns/passmaster/issues>
* Live version: <https://passmaster.io>
* Stanford Javascript Crypto Library: <https://bitwiseshiftleft.github.io/sjcl/>

## Author/Maintainter

 * [Ryan Johns](https://github.com/ryanjohns)

## License

Passmaster is released under the [GPLv3](https://www.gnu.org/licenses/).
