var cluster = require('cluster'),
    log4node = require('log4node'),
    log = new log4node.Log4Node({level: 'warning', file: 'test.log'});

log.setPrefix('%l %p : ');

var sublog = log.clone();

if (cluster.isMaster) {
  for (var i = 0; i < 4; i++) {
    cluster.fork();
  }

  sublog.error('Master started');

  cluster.on('exit', function(worker) {
    sublog.error('Worker ' + worker.process.pid + ' died');
  });
} else {
  sublog.error('Hello, I\'m a worker');
  setTimeout(function() {
    process.exit();
  }, 2000);
}
