var helper = require('./helper.js'),
    assert = require('assert'),
    fs = require('fs');

helper.create_test('no-cluster-sig', 'no-cluster-sig/test1.js', 'no-cluster-sig/output2', function(callback) {
  setTimeout(function() {
    helper.check_file('no-cluster-sig/output1');
    helper.launch('kill', ['-USR2', fs.readFileSync('process.pid')], null, function(code) {
      assert.equal(code, 0);
      callback();
    });
  }, 200);
}).export(module);
