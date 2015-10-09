var r = require('rethinkdb');
var Rx = require('rx');
var fetch = require("node-fetch");
var _ = require("underscore");
var geoutil = require('geoutil');
var feedWriter = require('./feedWriter');
var activeDriversWriter = require('./activeDriversWriter');

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
	    .then(data => {
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


var rethinkToRxStream = function(promise)
{
	return Rx.Observable.fromPromise(promise)
		   .flatMap((x)=>
		   {
		   	return Rx.Observable.create((obs)=>
	  			{
	  				x.each(
	  					(err, item)=>{
	  						obs.onNext(item.new_val || item);
	  					},
	  					() => obs.onCompleted());
	  				return function(){};
	  			});
		   });
}

var trafficDataTable = r.table('trafficdata');
var accidentsTable = r.table('accidents');


var listener = function(io, rethinkdbConnection){

	io.on('connection', function(socket){
		console.log('connected');
		var score = 0;
		var loggedInUser = null;
		var currentRide = null;

		var stateChangesSubscription;
		var premiumChangesSubscription;

		socket.on('start driving', (username, rideId) => {
			loggedInUser = username;
			feedWriter.stateChanged(username, 'started driving');
			currentRide = rideId;
			var trafficStream = rethinkToRxStream(trafficDataTable
			  	.filter({rideId:currentRide})
			  	.changes().run(rethinkdbConnection)).share();

			var timeScore = trafficStream
				.map(x => {
					var hourOfDay = new Date(x.time).getHours();
					console.log("Hour of day: " + hourOfDay);
					return hourOfDay < 6 ? 0.2 : 0;
				});

			var speedLimitMonitor = trafficStream
				.filter(x => x.eventType === "position")
				.sample(1000)
				.do(x => {console.log("speed stream:" + x)})
				.flatMap((event)=>{
					console.log(event.location.coordinates);
					return Rx.Observable.defer(() =>
						getMaxSpeed(event.location.coordinates[0], event.location.coordinates[1])
						.then(maxSpeed => {
							return {
								event: event,
								speedLimit: maxSpeed,
								isExceedingLimit: event.speed > maxSpeed
							};
						}));
				})
				.do((x) => console.log("SpeedLimit event: " + x))
				.share();

			var speedLimitScore = speedLimitMonitor
				.map(data => data.isExceedingLimit ? data.event.speed - data.speedLimit : 0)
				.do((x) => console.log("Speed limit score: " + x));

	  	 	var nearbyAccidentsMonitor = trafficStream
				.filter(x=>x.eventType === "position")
				.do((x)=>console.log("got position item:"+ x))
				.sample(10000)
				.flatMap(x=>{
					return rethinkToRxStream(accidentsTable
							.map(function(acc) { return {
								severity:acc('severity'),
							 	distance:acc('location').distance(x.location) }
							})
							.filter(r.row('distance').le(200))
							.run(rethinkdbConnection))
						.map(e => parseInt(e.severity) * 10)
						.sum()
						.do((x) => console.log("Nearby accidents score: " + x));
				}).share();

			var speedLimitStateChanges = speedLimitMonitor
				.distinctUntilChanged(data => data.isExceedingLimit)
				.map(x => x.isExceedingLimit ? 'exceeded speed limit' : 'is driving within speed limit');

			var nearbyAccidentsChanges = nearbyAccidentsMonitor
				.distinctUntilChanged()
				.map(x => x > 0 ? 'is entering accident-prone area' : 'is leaving accident-prone area');

			stateChangesSubscription = Rx.Observable.merge(speedLimitStateChanges, nearbyAccidentsChanges)
				.subscribe(state => feedWriter.stateChanged(username, state))

			premiumChangesSubscription = Rx.Observable.merge(nearbyAccidentsMonitor, speedLimitScore, timeScore)
				.scan((prev, curr) => prev + curr)
				.do((x) => console.log("Updating premium: " + x))
				.subscribe(function(rideScore){
					feedWriter.updatePremium(username, rideScore);
				},
				ex => console.log(ex));
	  	});

		socket.on('position update', (time, speed, location)=>{
			if (!loggedInUser) {
				return;
			}

			console.log("insert: " + time + ", " + speed + "," + location);			
			location = JSON.parse(location);

			//update firebase
			activeDriversWriter.updateLocation(loggedInUser, location);
	    	
	    	trafficDataTable.insert({
			    user:loggedInUser,
			    eventType: 'position',
			    rideId: currentRide,
			    time,
			    speed,
			    location: r.point(location.longitude, location.latitude)
			}).run(rethinkdbConnection);
		});

		socket.on('emergency brake', (time, severity)=>{
				//update rethinkdb
				//update firebase on break
		});

		socket.on('stop driving', (rideId)=>{
				//update rethinkdb
				//update firebase current speed
		});

		socket.on('disconnect', function () {
			stateChangesSubscription && stateChangesSubscription.dispose();
			premiumChangesSubscription && premiumChangesSubscription.dispose();
		});

	});
}
module.exports = listener;
