var helper = require('./helper.js');

helper.create_test('no-cluster', 'no-cluster/test1.js', 'no-cluster/output2', function(callback) {
  setTimeout(function() {
    helper.check_file_async('no-cluster/output1', callback);
  }, 200);
}).export(module);
