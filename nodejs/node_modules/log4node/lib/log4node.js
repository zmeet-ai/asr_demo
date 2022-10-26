// Copyright 2012 Bertrand Paquet
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var fs = require('fs'),
    util = require('util'),
    cluster = require('cluster'),
    events = require('events');

// prevent multiple lo4node instanciation
var i_am_the_master = false;
if (!process.log4NodeMasterChoosen) {
  process.log4NodeMasterChoosen = true;
  i_am_the_master = true;
}

var
  loggers = {},
  // levels are accessible through the exports object in uppercase
  // eg: exports.EMERGENCY === 0
  // all levels are also available as function helpers
  // eg: logger.alert('message')
  levels = {
  'emergency':  0,
  'alert':      1,
  'critical':   2,
  'error':      3,
  'warning':    4,
  'notice':     5,
  'info':       6,
  'debug':      7
};

var sig_listener = new events.EventEmitter();
sig_listener.setMaxListeners(0);

process.on('SIGUSR2', function() {
  sig_listener.emit('SIGUSR2');
});

var master_message_listener = new events.EventEmitter();

var worker_online = new events.EventEmitter();
worker_online.setMaxListeners(0);

if (cluster.isMaster) {
  cluster.on('online', function(worker) {
    worker_online.emit('online', worker);
  });
  worker_online.on('online', function(worker) {
    if (i_am_the_master) {
      worker.on('message', function(msg) {
        if (msg.log && msg.logger_id && loggers[msg.logger_id]) {
          loggers[msg.logger_id].write(msg.log);
        }
      });
    }
  });
}
else {
  process.on('message', function(msg) {
    master_message_listener.emit('message', msg);
  });
}

function computePrefix(prefix, level) {
  if (typeof prefix === 'function') {
    return prefix(level);
  }
  else {
    return prefix
      .replace(/%d/, new Date().toUTCString())
      .replace(/%l/, level.toUpperCase())
      .replace(/%p/, process.pid);
  }
}

function Log4Node(config) {
  config = config || {};
  if (config.write_callback) {
    this.write_callback = config.write_callback;
  }
  if (config.parent) {
    this.parent = config.parent;
    this.setLogLevel(config.level || this.parent.level);
    var child_prefix = config.prefix || '';
    this.prefix = function(level) {
      return computePrefix(this.parent.prefix, level) + computePrefix(child_prefix, level);
    }.bind(this);
    this.id = this.parent.id;
  }
  else {
    this.setLogLevel(config.level);
    this.prefix = config.prefix || '[%d] %l ';
    this.id = config.file || 'stdout';
    this.file = config.file;
    loggers[this.id] = this;
    if (cluster.isMaster) {
      if (config.file === undefined) {
        this.stream = process.stdout;
      }
      else {
        this.reopen();
        if (!process.env.LOG4NODE_USE_IPC) {
          worker_online.on('online', function(worker) {
            worker.send({file: this.file, reopen: true});
          }.bind(this));
        }
        sig_listener.on('SIGUSR2', function() {
          this.reopen();
        }.bind(this));
        this.stream.on('error', function(err) {
          console.warn('Unable to write into file : ' + this.file + ' ' + err);
        }.bind(this));
      }
    }
    else {
      master_message_listener.on('message', function(msg) {
        if (msg.reopen && msg.file && msg.file === this.file) {
          this.reopen();
        }
      }.bind(this));
    }
  }
}

Log4Node.prototype.clone = function(config) {
  config = config || {};
  config.parent = this;
  return new Log4Node(config);
};

Log4Node.prototype.reopen = function() {
  if (this.stream) {
    this.stream.end();
  }
  this.stream = fs.createWriteStream(this.file, {flags: 'a', encoding: 'utf-8'});
  this.stream.on('error', function(err) {
    console.error('Error when writing to log file', err);
  });
  if (cluster.isMaster && !process.env.LOG4NODE_USE_IPC) {
    Object.keys(cluster.workers).forEach(function(id) {
      cluster.workers[id].send({file: this.file, reopen: true});
    }.bind(this));
  }
};

Log4Node.prototype.setPrefix = function(prefix) {
  this.prefix = prefix;
};

Log4Node.prototype.setLogLevel = function(level) {
  if (typeof level === 'string') {
    level = levels[level];
  }
  this.level = level === undefined ? levels.info : level;
};

Log4Node.prototype.getLogLevel = function() {
  return this.level;
};

Log4Node.prototype.write = function(msg) {
  if (this.write_callback) {
    try {
      this.write_callback(msg);
    }
    catch(e) {
      console.warn('Error when calling write callback', e);
    }
  }
  else if (this.parent) {
    this.parent.write(msg);
  }
  else {
    if (this.stream) {
      this.stream.write(msg + '\n');
    } else {
      if (process.connected) {
        process.send({log: msg, logger_id: this.id});
      } else {
        // do no try to send a message to master if disconnected
        // because in this case node will emit an error event
        console.warn('Log output not yet initialized for message:', msg);
      }
    }
  }
};

Log4Node.prototype.log = function(level, args) {
  if (levels[level] <= this.level) {
    var msg = computePrefix(this.prefix, level);
    msg += util.format.apply(this, args);
    this.write(msg);
  }
};

Log4Node.prototype.close = function() {
  if (this.stream) {
    if (this.stream !== process.stdout) {
      this.stream.end();
    }
    this.stream = null;
  }
};

// exports
exports.Log4Node = Log4Node;

Object.keys(levels).forEach(function(level) {
  // Log4Node.INFO|DEBUG..
  exports[level.toUpperCase()] = levels[level];

  exports['level_' + levels[level]] = level;

  // Log4Node.prototype.info|debug..
  Log4Node.prototype[level] = function() {
    this.log(level, arguments);
  };
});

// set easy defaultLogger
// allows require('Log4Node').info('')|debug('')..
var defaultLogger = new Log4Node();

Object.keys(Log4Node.prototype).forEach(function(method) {
  exports[method] = function() {
    return defaultLogger[method].apply(defaultLogger, arguments);
  };
});

exports.reconfigure = function(config) {
  defaultLogger = new Log4Node(config);
  return defaultLogger;
};
