var io = require('socket.io-client');
var Rx = require('rx');

var socket = io.connect("http://localhost:3000");
socket.emit('start driving', "yshay", 1);
socket.emit('position update', new Date(), 100, JSON.stringify({longitude:34.946, latitude:32.180}));

Rx.Observable.interval(1000)
	.subscribe((x) => socket.emit('position update', new Date(), 100, JSON.stringify({longitude:34.946, latitude:32.180})));

console.log("Done");