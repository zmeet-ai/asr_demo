var helper = require('./helper.js'),
    assert = require('assert');

helper.create_test('no-cluster-logrotate', 'no-cluster-logrotate/test1.js', 'no-cluster-logrotate/output2', function(callback) {
  helper.logrotate(function(logrotate) {
    setTimeout(function() {
      helper.check_file('no-cluster-logrotate/output1');
      helper.launch(logrotate, ['-f', 'no-cluster-logrotate/logrotate.conf', '-s', '/tmp/s'], null, function(code) {
        assert.equal(0, code);
        callback();
      });
    }, 200);
  });
}, function() {
  helper.check_file('no-cluster-logrotate/output1', 'test.log.1');
}).export(module);
