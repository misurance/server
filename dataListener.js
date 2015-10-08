var r = require('rethinkdb');
var Rx = require('rx');

var rethinkToRxStream = function(promise)
{
	return Rx.Observable.fromPromise(promise)
		   .flatMap((x)=>
		   {
		   	console.log(x);
		   	return Rx.Observable.create((obs)=>
	  			{
	  				x.each((err, item)=>{
	  					obs.onNext(item.new_val || item);
	  				});
	  				return function(){};
	  			});
		   });
}

var trafficDataTable = r.table('trafficdata');
var accidentsTable = r.table('accidents');


var listener = function(io, rethinkdbConnection){
	io.on('connection', function(socket){
		var score = 0;

	  var loggedInUser = null;
	  var currentRide = null;

	  

	  socket.on('start driving', (username, rideId)=>{
	  	 loggedInUser = username;
	  	 currentRide = rideId;
	  	 var trafficStream = rethinkToRxStream(trafficDataTable
		  	.filter({rideId:currentRide})
		  	.changes().run(rethinkdbConnection)).share();

		  var crashesScore = trafficStream
		  					 .do(x=>console.log(x))
		  					 .do((x)=>console.log("got item:"+ x.eventType ) )
		  					 .filter(x=>x.eventType === "position")
		  					 .do((x)=>console.log("got position item:"+ x))
		  					 .throttle(5000)
		  					 .flatMap(x=>{
		  					 	return rethinkToRxStream(
		  					 		accidentsTable.map(function(acc) { return { severity:acc('severity'),
		  					 		 distance:acc('location').distance(x.location) }})
		  					 		 .filter(r.row('distance').le(100))
		  					 		 .run(rethinkdbConnection))
		  					 	     .map(e=>parseInt(e.severity));
		  					 }).scan((a,b)=> a+b)
	  						  .subscribe(function(score){
	  						  	console.log(score);
	  						  });
		  	

		
	  });

	  socket.on('position update', (time, speed, location)=>{
	  		trafficDataTable.insert({
			    user:loggedInUser,
			    eventType: 'position', 
			    rideId: currentRide,
			    time,
			    speed,
			    location: r.point(location.longitude, location.latitude)
			}).run(rethinkdbConnection);

			//update firebase

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
}
module.exports = listener;