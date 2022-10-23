var log4node = require('log4node'),
    log = new log4node.Log4Node({level: 'warning', file: 'test.log'});

log.setPrefix(process.argv[2] + ' ');

log.warning('titi1');

setTimeout(function() {
  log.warning('titi2');
}, 500);
