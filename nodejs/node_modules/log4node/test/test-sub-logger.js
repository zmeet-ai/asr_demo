var helper = require('./helper.js');

helper.create_test('sub-logger', 'sub-logger/test1.js', 'sub-logger/output2', function(callback) {
  setTimeout(function() {
    helper.check_file_async('sub-logger/output1', callback);
  }, 200);
}).export(module);


