namespace :cover_me do

  desc 'Generates and opens code coverage report'
  task :report do
    require 'cover_me'
    CoverMe.complete!
  end

end

namespace :test do

  desc 'Runs test and cover_me:report together'
  task :coverage do
    Rake::Task['test'].invoke
    Rake::Task['cover_me:report'].invoke
  end

end
