var TestRunner = require('grunt-saucelabs/src/TestRunner');
var request = require('request');

var BROWSERS = [
  {
    platform: 'Windows 8.1',
    version: '',
    browserName: 'Chrome'
  }
];

console.log(process.env.SAUCE_USERNAME)

var runner = new TestRunner({
  username: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  urls: ['http://builds.emberjs.com/lolfivetanley/saucelabs.html'],
  browsers: BROWSERS
}, 'qunit', function(){});

var done = function(result){
}


runner.runTests().then(done).
  then(function(){
  console.log('done');
}, function(err){
  console.log('err', err);
  process.exit(1);
});
