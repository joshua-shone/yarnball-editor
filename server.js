var express = require('express');
var http    = require('http');
var yargs   = require('yargs');

var app = express();
var server = http.Server(app);

app.use(express.static('.'));
app.use('/yarnball/core', express.static('node_modules/yarnball/src'));
app.use(express.static('bower_components/'));

var port = yargs.argv['port'] || 8080;

server.listen(port, function() {
  console.log('Serving on port ' + port);
});
