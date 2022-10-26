var helper = require('./helper.js'),
    assert = require('assert');

helper.create_test('multiple-appender', 'multiple-appender/test1.js', 'multiple-appender/output2', null, function() {
  helper.check_file('test.log.1', 'multiple-appender/output1');
}, function(f, callback) {
  var process1_ok = false;
  var process2_ok = false;
  helper.launch('node', [f, 'p1'], 'process1.pid', function(code) {
    assert.equal(code, 0);
    process2_ok = true;
  });
  setTimeout(function() {
    helper.launch('node', [f, 'p2'], 'process2.pid', function(code) {
      assert.equal(code, 0);
      process1_ok = true;
    });
  }, 20);
  helper.logrotate(function(logrotate) {
    setTimeout(function() {
      helper.launch(logrotate, ['-f', 'multiple-appender/logrotate.conf', '-s', '/tmp/s'], null, function() {});
    }, 200);
  });
  setTimeout(function() {
    assert(process1_ok);
    assert(process2_ok);
    callback(undefined, 0);
  }, 1000);
}).export(module);
