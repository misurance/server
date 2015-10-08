var r = require('rethinkdb');
var Rx = require('rx');
var fetch = require("node-fetch");
var _ = require("underscore");
var geoutil = require('geoutil');
var feedWriter = require('./feedWriter');

var speedLimitByHighwayType = {
	motorway: 110,
	trunk: 100,
	primary: 90,
	secondary: 70,
	tertiary: 60,
	residential: 50
};


var baseUrl = "http://overpass.osm.rambler.ru/cgi/interpreter?data=";

var findClosestNode = function(lon, lat, nodes)
{
	return Rx.Observable.fromArray(nodes)
			.minBy(x=>geoutil.pointDistance([lon,lat],[x.lon, x.lat]))
			.toPromise();
}

var getMaxSpeed = _.memoize(function(lon, lat){
	var bbox = [ lat - .0002, lon - .0002, lat + .0002, lon + .0002];

	var data = "[out:json];way(" + bbox.join(",") + ");(._;>;);out;";
	var url = baseUrl + encodeURIComponent(data);
	console.log(url);

	return fetch(url).then(res => res.json())
	    .then(data =>{
	    	return findClosestNode(lon, lat, data.elements.filter(x=>x.type==="node")).then(
	    		closestNode => {
	    			closestNode =closestNode[0];
	    			var way = data.elements.filter(x=>x.type === "way")
	    						 .filter(x=> x.id === closestNode.id || (x.nodes && x.nodes.indexOf(closestNode.id) !== -1))[0];

	    			if (way.tags.maxspeed)
	    			{
	    				return maxspeed;
	    			}

	    			if (way.tags.highway)
	    			{
	    				return speedLimitByHighwayType[way.tags.highway] || 50;
	    			}

	    			return 50;
	    		});


	    });
});

// function fetchObs()
// {
// 	return Rx.Observable.fromPromise(fetch.apply(null,arguments).then(x=>x.text()));
// }


var rethinkToRxStream = function(promise)
{
	return Rx.Observable.fromPromise(promise)
		   .flatMap((x)=>
		   {
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
			 feedWriter.write(username, 'Drive started');
	  	 currentRide = rideId;
	  	 var trafficStream = rethinkToRxStream(trafficDataTable
		  	.filter({rideId:currentRide})
		  	.changes().run(rethinkdbConnection)).share();

	  	 var speedScore = trafficStream
		  					 .filter(x=>x.eventType === "position")
		  					 .sample(1000)
		  					 .combineLatest(Rx.Observable.interval(1000), (a, b) => a)
		  					 .do(x=> {console.log("speed stream:" + x)})
		  					 .flatMap((event)=>{
		  					 	console.log(event.location.coordinates);
		  					 	return Rx.Observable.defer(() =>
		  					 		getMaxSpeed(event.location.coordinates[0], event.location.coordinates[1])
		  					 		.then(maxSpeed => {
		  					 			return {
		  					 				event: event,
		  					 				speedLimit: maxSpeed
		  					 			};
		  					 		}));

		  					 }).subscribe((data)=>{
		  					 	var score = (data.event.speed > data.speedLimit) ? data.speedLimit - data.event.speed : 0;
		  					 	console.log( { 
		  					 		currentSpeed: data.event.speed,
		  					 	 	speedLimit: data.speedLimit,
		  					 	 	score: score
		  					 	 });
		  					 },
		  					 (ex)=> {
		  					 	console.log("error");
		  					 	console.log(ex);
		  					 });

		  var crashesScore = trafficStream
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
