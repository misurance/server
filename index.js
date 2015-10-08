var io = require('socket.io')(process.env.PORT || 5000);
var r = require('rethinkdb');

var options = {
    host: 'ec2-52-17-218-63.eu-west-1.compute.amazonaws.com',
    port: 28015,
    db: 'misurance',
    authKey: 'mHZ5dkYYkvBwdmKX',
    timeout: 40
};

var rethinkdbConnection;

r.connect(options).then(function(connection) {
	rethinkdbConnection = connection;
});

var trafficDataTable = r.table('TrafficData');


io.on('connection', function(socket){
  var loggedInUser = null;
  var currentRide = null;

  var trafficDataStream = trafficDataTable
  	.filter({ride:loggedInUser})
  	.changes().run(rethinkdbConnection);

  Rx.Node.fromStream(trafficDataStream)
  	.subscribe((x)=>{
  		console.log(x);
  	});
  

  socket.on('start driving', (username, rideId)=>{
  	 loggedInUser = username;
  	 currentRide = rideId;
  });

  socket.on('position update', (time, speed, location)=>{
  		trafficDataTable.insert({
		    user:loggedInUser,
		    eventType: 'position', 
		    rideId,
		    time,
		    speed,
		    location,
		})
  });

  socket.on('emergency brake', (time, severity)=>{
  		//update rethinkdb
  		//update firebase on break
  });

  socket.on('stop driving', (rideId)=>{
  		//update rethinkdb
  		//update firebase current speed
  });

});
