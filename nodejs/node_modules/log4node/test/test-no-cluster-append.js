var helper = require('./helper.js'),
    assert = require('assert');

helper.create_test('no-cluster-append', 'no-cluster-append/test1.js', 'no-cluster-append/output2', null, null, function(f, callback) {
  helper.launch('node', [f], null, function(code) {
    assert.equal(code, 0);
    helper.check_file('no-cluster-append/output1');
    helper.launch('node', [f], null, function(code) {
      callback(null, code);
    });
  });
}).export(module);
