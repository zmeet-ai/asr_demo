var vows = require('vows'),
    assert = require('assert'),
    log4node = require('log4node');

vows.describe('Test ').addBatch({
  'write callback': {
    topic: function() {
      var l = [];
      var logger = new log4node.Log4Node({
        level: 'info',
        write_callback: function(s) {
          l.push(s);
        },
        prefix: '%l '
      });

      var subLogger = logger.clone({
        prefix: 'toto ',
      });

      logger.info('start');
      subLogger.error('stop');

      var callback = this.callback;
      setTimeout(function() {
        callback(null, l);
      }, 200);
    },

    check: function(err, l) {
      assert.ifError(err);
      assert.deepEqual(l, ['INFO start', 'ERROR toto stop']);
    }
  },
  'write callback exception': {
    topic: function() {
      var l = [];
      var logger = new log4node.Log4Node({
        level: 'info',
        write_callback: function() {
          throw new Error('toto');
        },
        prefix: '%l '
      });

      logger.info('start');

      var callback = this.callback;
      setTimeout(function() {
        callback(null, l);
      }, 200);
    },

    check: function(err, l) {
      assert.ifError(err);
      assert.deepEqual(l, []);
    }
  },
}).export(module);
