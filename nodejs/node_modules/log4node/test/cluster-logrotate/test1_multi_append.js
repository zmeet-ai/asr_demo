var cluster = require('cluster'),
    log4node = require('log4node'),
    log = new log4node.Log4Node({level: 'warning', file: 'test.log'});

log.setPrefix('%l %p : ');

if (cluster.isMaster) {
  for (var i = 0; i < 4; i++) {
    cluster.fork();
  }

  log.error('Master started');

  cluster.on('exit', function(worker) {
    log.error('Worker ' + worker.process.pid + ' died');
  });
} else {
  log.error('Hello, I\'m a worker');
  setTimeout(function() {
    log.error('Hello one more time');
    setTimeout(function() {
      process.exit();
    }, 200);
  }, 2000);
}
