var helper = require('./helper.js'),
    assert = require('assert'),
    fs = require('fs');

helper.create_test('no-cluster-stdout-sig', 'no-cluster-stdout-sig/test1.js', null, function(callback) {
  setTimeout(function() {
    helper.launch('kill', ['-USR2', fs.readFileSync('process.pid')], null, function(code) {
      assert.equal(code, 0);
      callback();
    });
  }, 200);
}, function(stdout) {
  helper.check_content(stdout, 'no-cluster-stdout-sig/output1');
}).export(module);
