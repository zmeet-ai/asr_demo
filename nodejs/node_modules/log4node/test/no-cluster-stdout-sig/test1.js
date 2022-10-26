var log4node = require('log4node');

log4node.setPrefix('[%l - toto] ');

log4node.warning('titi1');

setTimeout(function() {
  log4node.error('titi2');
}, 2000);


