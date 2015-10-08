var r = require('rethinkdb');
var fs = require('fs');
var parse = require('csv-parse');
var proj4 = require('proj4');

var firstProjection = '+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +towgs84=-48,55,52,0,0,0,0 +units=m';
var secondProjection = 'WGS84';

var options = {
	host: 'ec2-52-17-218-63.eu-west-1.compute.amazonaws.com',
	port: 28015,
	db: 'misurance',
	authKey: 'mHZ5dkYYkvBwdmKX',
	timeout: 40
};

r.connect(options).then(function(connection) {
		process.on('SIGINT', function() {
			connection.close().then(function() {
				console.log("closed db connection");
				process.exit();
			});
		});

		var parser = parse({}, function(err, data){
			data.forEach(function(row) { 
				var coordinates = proj4(firstProjection,secondProjection).forward([row[row.length -2],row[row.length -1]]);

				if (row.length > 1) {
					var accident = {
						id: row[0],
						severity: row[22],
						location: r.point(coordinates[0],coordinates[1]),
					};

					r.db('misurance').table('accidents').insert(accident).run(connection)
						.then(function(res) {
							console.log("inserted");
						})
						.catch(function(err) {
							console.log("failed: " + err);
							console.error(err);
						});
					}
			});
		});

		fs.createReadStream('./H20141041AccData.csv').pipe(parser);
	})
	.catch(function(err) {
		console.log(err);
	});

console.log("waiting 60 seconds");
setTimeout(function() { }, 60000);