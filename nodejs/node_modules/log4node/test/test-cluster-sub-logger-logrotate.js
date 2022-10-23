var helper = require('./helper.js'),
    assert = require('assert');

helper.create_test('cluster-sub-logger-logrotate', 'cluster-sub-logger-logrotate/test1.js', 'cluster-sub-logger-logrotate/output2', function(callback) {
  helper.logrotate(function(logrotate) {
    setTimeout(function() {
      helper.check_file('cluster-sub-logger-logrotate/output1');
      helper.launch(logrotate, ['-f', 'cluster-sub-logger-logrotate/logrotate.conf', '-s', '/tmp/s'], null, function(code) {
        assert.equal(0, code);
        callback();
      });
    }, 1000);
  });
}, function() {
  helper.check_file('cluster-sub-logger-logrotate/output1', 'test.log.1');
}).export(module);
