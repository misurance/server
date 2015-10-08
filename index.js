var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var r = require('rethinkdb');
var listener = require("./dataListener");

require('./api')(app);

app.use(express.static('public'));

// app.get('/', function(req, res){
//     res.send('<h1>Hello world</h1>');
//   });

var options = {
    host: 'ec2-52-17-218-63.eu-west-1.compute.amazonaws.com',
    port: 28015,
    db: 'misurance',
    authKey: 'mHZ5dkYYkvBwdmKX',
    timeout: 40
};

r.connect(options).then(function(connection) {
	listener(io,connection);
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
