var cluster = require('cluster'),
    log = require('log4node');

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
    process.exit();
  }, 500);
}
