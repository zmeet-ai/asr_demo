var log = require('log4node');

log.reconfigure({level: 'warning', file: 'test.log', prefix: '%l %p : '});

var sublogger1 = log.clone({prefix: 'SUB1 - '});
var sublogger2 = log.clone({prefix: 'SUB2 - ', level: 'error'});

sublogger1.warning('titi1');

setTimeout(function() {
  sublogger2.critical('titi2');
  sublogger2.warning('titi3');
}, 500);

sublogger1.warning('titi4');
