var helper = require('./helper.js'),
    vows = require('vows'),
    assert = require('assert'),
    log4node = require('log4node');

vows.describe('Test ').addBatch({
  'set log level': {
    'topic': function() {
      var logger = new log4node.Log4Node({level: 'info', file: 'test.log'});
      logger.setPrefix('');

      logger.debug('start_debug');
      logger.info('start');
      logger.setLogLevel('critical');
      logger.info('stop');
      logger.critical('stop_critical');

      var callback = this.callback;
      setTimeout(function() {
        callback(null);
      }, 200);
    },
    'check': function(err) {
      assert.ifError(err);
      helper.check_file_content('test.log', 'start\nstop_critical\n');
      helper.remove_test_files();
    }
  }
}).export(module);

