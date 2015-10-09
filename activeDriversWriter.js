var Firebase = require("firebase");
var ref = new Firebase("https://intense-inferno-8553.firebaseio.com").child('active');

module.exports = {
  updateLocation : function(userId, location){
    var location = {
     location : location
   };
   ref.child(userId).update(location);
  }
};
