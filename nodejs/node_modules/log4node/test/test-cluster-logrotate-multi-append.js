var helper = require('./helper.js'),
    assert = require('assert');

helper.create_test('cluster-logrotate-multi-append', 'cluster-logrotate/test1_multi_append.js', 'cluster-logrotate/output2', function(callback) {
  helper.logrotate(function(logrotate) {
    setTimeout(function() {
      helper.check_file('cluster-logrotate/output1');
      helper.launch(logrotate, ['-f', 'cluster-logrotate/logrotate.conf', '-s', '/tmp/s'], null, function(code) {
        assert.equal(0, code);
        callback();
      });
    }, 1000);
  });
}, function() {
  helper.check_file('cluster-logrotate/output1', 'test.log.1');
}).export(module);
