var cluster = require('cluster'),
    vows = require('vows'),
    assert = require('assert'),
    log4node = require('log4node');

vows.describe('Test process.send').addBatch({
  'is not called when a worker process is disconnected': {
    'topic': function() {
      // setup process as a worker process
      cluster.isMaster = false;
      var calls = 0;
      process.send = function() {
        calls ++;
      };

      log4node.info('log me baby');

      log4node.close();
      process.connected = true;

      log4node.info('log me baby');
      log4node.info('log me baby 2 times');

      // when disconnected (ie, master dies)
      process.connected = false;

      log4node.info('log me baby');

      return calls;
    },
    'check': function(calls) {
      assert.equal(calls, 2);
    }
  }
}).export(module);
