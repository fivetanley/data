require "bundler/setup"
require "ember-dev/tasks"

directory "tmp"

file "tmp/ember.js" => "tmp" do
  cd "tmp" do
    sh "git clone https://github.com/emberjs/ember.js.git"
  end
end

task :update_ember_git => ["tmp/ember.js"] do
  cd "tmp/ember.js" do
    sh "git fetch origin"
    sh "git reset --hard origin/master"
  end
end

file "tmp/ember.js/dist/ember.js"

file "packages/ember/lib/main.js" => [:update_ember_git, "tmp/ember.js/dist/ember.js"] do
  cd "tmp/ember.js" do
    sh "rake dist"
    cp "dist/ember.js", "../../packages/ember/lib/main.js"
  end
end

task :update_ember => "packages/ember/lib/main.js"


task :clean => "ember:clean"
task :dist => "ember:dist"
task :test, [:suite] => "ember:test"
task :default => :dist

task :publish_build do
  require 'date'
  require 'aws-sdk'
  s3 = AWS::S3.new(
    :access_key_id => ENV['S3_ACCESS_KEY_ID'],
    :secret_access_key => ENV['S3_SECRET_ACCESS_KEY']
  )
  bucket = s3.buckets["#{ENV['S3_BUCKET_NAME']}"]
  now = Time.now.strftime('%Y-%m-%d_%M')
  ember_data_prod = bucket.objects["ember.js-development-#{now}.js"]
  ember_data_prod.write File.expand_path File.dirname(__FILE__) + '/dist/ember.js'
end

