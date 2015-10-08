var Firebase = require("firebase");
var ref = new Firebase("https://intense-inferno-8553.firebaseio.com").child("active");
var drivers = [];
var num = 5;
for (var i = 0; i < num; i++) {
  drivers[i] = {
    key : "test" + i,
    location:{
    latitude:32.0667,
    longitude:34.8000
    }
  };
};
setInterval(function(){
  for (var i = 0; i < num; i++) {
    drivers[i].location.latitude += 0.001 *  Math.floor((Math.random() * 3) - 1 );
    drivers[i].location.longitude += 0.001 *  Math.floor((Math.random() * 3) - 1 );
    ref.child(drivers[i].key).update({
      location: drivers[i].location
    })
  }

 // console.log(event);
},300);
