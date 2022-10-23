var fs = require('fs'),
    vows = require('vows'),
    assert = require('assert'),
    spawn = require('child_process').spawn,
    whereis = require('whereis');

function launch(command, args, pid_file, callback) {
  var child  = spawn(command, args);
  var stdout = '';

  if (pid_file) {
    fs.writeFile(pid_file, child.pid, function(err) {
      if (err) {
        return console.warn(err);
      }
    });
  }

  child.stdout.on('data', function (data) {
    console.log('child stdout [' + command + ']: ' + data);
    stdout += data;
  });

  child.stderr.on('data', function (data) {
    console.log('child stderr [' + command + ']: ' + data);
  });

  child.on('exit', function(code) {
    callback(code, stdout);
  });
}

function remove_test_files() {
  fs.readdirSync('.').forEach(function(i) {
    if (i.match(/^test.log.*$/) || i.match(/^process.*/)) {
      fs.unlinkSync(i);
    }
  });
  if (fs.existsSync('/tmp/s')) {
    fs.unlinkSync('/tmp/s');
  }
}

function check_content(content, file) {
  var regexp = fs.readFileSync(file, 'utf-8');
  if (!content.match(new RegExp('^' + regexp + '$'))) {
    console.log('Content');
    console.log(content);
    console.log('Regexp');
    console.log(regexp);
    assert.fail('File not match');
  }
}

function check_content_async(content, file, callback) {
  fs.readFile(file, 'utf-8', function(err, regexp) {
    assert.ifError(err);
    if (!content.match(new RegExp('^' + regexp + '$'))) {
      console.log('Content');
      console.log(content);
      console.log('Regexp');
      console.log(regexp);
      assert.fail('File not match');
    }
    callback();
  });
}

function check_file(file, target_file) {
  target_file = target_file || 'test.log';
  var content = fs.readFileSync(target_file, 'utf-8');
  check_content(content, file);
}

function check_file_async(file, target_file, callback) {
  if (typeof target_file === 'function') {
    callback = target_file;
    target_file = undefined;
  }
  target_file = target_file || 'test.log';
  fs.readFile(target_file, 'utf-8', function(err, content) {
    assert.ifError(err);
    check_content_async(content, file, callback);
  });
}

function check_file_content(file, expected_content) {
  var content = fs.readFileSync(file, 'utf-8');
  assert.equal(content, expected_content);
}

function MultipleHandler(callback) {
  this.code = null;
  this.stdout = null;
  this.counter = 1;
  this.callback = callback;
}

MultipleHandler.prototype.main = function(code, stdout) {
  this.code = code;
  this.stdout = stdout;
  this.end();
};

MultipleHandler.prototype.end = function() {
  this.counter = this.counter - 1;
  if (this.counter === 0) {
    this.callback(null, this.code, this.stdout);
  }
};

function create_test(name, file_to_launch, final_file, topic_callback, check_callback, test_callback) {
  var test_name = file_to_launch.match(/\/([^\/]+)\.js$/)[1];
  var test = {};
  test[test_name] = {
    topic: function () {
      remove_test_files();
      test_callback = test_callback || function(f, callback) {
        var my_handler = new MultipleHandler(callback);
        launch('node', [f], 'process.pid', function(code, stdout) {
          my_handler.main(code, stdout);
        });
        if (topic_callback) {
          my_handler.counter = my_handler.counter + 1;
          topic_callback(function() {
            my_handler.end();
          });
        }
      };
      test_callback(file_to_launch, this.callback);
    },

    'check_code': function(code) {
      assert.equal(code, 0);
    },

    'check content': function () {
      if (final_file) {
        check_file(final_file);
      }
    },
  };
  if (check_callback) {
    test[test_name].specific_check = function(err, code, stdout) {
      check_callback(stdout);
    };
  }
  test[test_name]['remove test files'] = function() {
    remove_test_files();
  };
  return vows.describe(name).addBatch(test);
}

function logrotate(callback) {
  whereis('logrotate', function(err, res) {
    if(err) {
      console.log('You must have logrotate in your path to run all tests.');
      return process.exit(1);
    }
    callback(res);
  });
}

module.exports = {
  launch: launch,
  remove_test_files: remove_test_files,
  check_file: check_file,
  check_file_async: check_file_async,
  check_content: check_content,
  check_file_content: check_file_content,
  create_test: create_test,
  logrotate: logrotate,
};