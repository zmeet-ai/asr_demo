# Overview

[![Build Status](https://travis-ci.org/bpaquet/log4node.png)](https://travis-ci.org/bpaquet/log4node)

This module is designed to be used with Node Cluster in production:
* one log file for all workers
* compatible with logrotate: an USR2 signal reopen the log file

This module is compatible with node 0.8.x. For the node 0.6.x, please use version 0.0.1 of this module.

This module is inspired from [this module](https://github.com/visionmedia/log.js).

# How to use it

## Installation

    npm install log4node

## Usage

Default logger:
```js
var log = require('log4node');

log.error("this is a log");
```
Will output to console.

Note: you can reconfigure default logger by calling

    log.reconfigure({level: 'info', file: 'toto.log'});

Will now write into `toto.log`

Your custom logger:
```js
var log4node = require('log4node');
    log = new log4node.Log4Node({level: 'warning', file: 'test.log'});

log.error("this is a log");
log.debug("this is a debug log");
```

Note : you can use the syntax accepted by [`utils.format`](http://nodejs.org/api/util.html#util_util_format_format).

## Log level

Log level can be adjusted for each logger:

    log.setLogLevel('info');

Log level for default logger is 'info'.

Available log levels are:

* emergency
* alert
* critical
* error
* warning
* notice
* info
* debug

## Prefix

Prefix of log lines can be changed:

```js
log.setPrefix("%d - %p ");
```

You can use following field in prefix:
* `%d`: current date
* `%p`: current process id
* `%l`: log level

Default prefix is: `[%d] %l `

You can also use a function to specify prefix :

```js
log.setPrefix(function(level) {
  return 'toto ' + (new Date()).toString() + ' ';
});
```

## Cluster mode

Workers processes will send logs to the cluster master for writing to file.

Setup is fully transparent for developper.

A full example can be found [here](https://github.com/bpaquet/log4node/blob/master/test/cluster/test1.js).

## Reopen log file

Just send USR2 signal to node process, or, in cluster mode, to master node process:

    kill -USR2 pid

Example of logrotate file:

    /var/log/node.log {
      rotate 5
      weekly
      postrotate
        kill -USR2 `cat process.pid`
      endscript
    }

## Create a specialized logger
This feature is provided to specialize a logger for a sub-component.
You can create a new logger with its own level and prefix for a sub-component.
The logs will be send to the same files with a prefix.

```js
log = new log4node.Log4Node({log_level: 'warning', file: 'test.log'});
sublogger1 = log.clone({prefix:'SUBMODULE - ', level:'error');
```

or with the default logger

```js
sublogger1 = log4node.clone(prefix:'SUBMODULE - ', level:'error');
```

## Mutliple instanciation

If you have a module A which depends of log4node, and a module B which also depends of log4node, you have to use only one instance, for example by giving the log4node instance of A to B.


## Write callback

If you want to plug a custom transport, just specify a write_callback
```js
log = new log4node.Log4Node({
  write_callback: function(line) {
  // do something with the formatted line of log.
  }
});
```

# Changelog

## Version 0.1.6

- Add write callback

## Version 0.1.5

- In cluster mode, workers open the log files in append mode instead of sending logs to the master. You can revert to the old way (always send log to master).

# License

Copyright 2012 Bertrand Paquet

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
