var helper = require('./helper.js');

helper.create_test('sub-logger-default', 'sub-logger-default/test1.js', 'sub-logger-default/output2', function(callback) {
  setTimeout(function() {
    helper.check_file_async('sub-logger-default/output1', callback);
  }, 200);
}).export(module);


