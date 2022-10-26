var cluster = require('cluster'),
    log4node = require('log4node'),
    log = new log4node.Log4Node({prefix:'warning', file:'test.log'});

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
  var workerLog = log.clone({prefix: 'WORKER - '});

  workerLog.error('Hello, I\'m a worker');
  setTimeout(function() {
    process.exit();
  }, 100);
}
