var cluster = require('cluster'),
    log4node = require('log4node');

if (cluster.isMaster) {
  for (var i = 0; i < 4; i++) {
    cluster.fork();
  }
  var log = new log4node.Log4Node({level: 'warning', file: 'test.log'});
} else {
  var log = new log4node.Log4Node({level: 'warning', file: 'test.log'});
  log.setPrefix('%l %p : ');
  log.error('Hello, I\'m a worker');
  setTimeout(function() {
    process.exit();
  }, 100);
}
