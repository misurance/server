var Firebase = require("firebase");
var ref = new Firebase("https://intense-inferno-8553.firebaseio.com");

module.exports = {
  write : function(userId, message, premiumChange){
    var date = new Date();
    var event = {
     time: date.getHours() + ':' + date.getMinutes(),
     message: message,
     change: premiumChange || 0
   };
   console.log('Writing event: ' + JSON.stringify(event));
   ref.child(userId).child('feed').push(event);
  }
};
