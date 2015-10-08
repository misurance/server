var Firebase = require("firebase");
var ref = new Firebase("https://intense-inferno-8553.firebaseio.com");

module.exports = {
  updatePremium: function(userId, rideScore){
    var date = new Date();
    var event = {
      type: 'updatePremium',
      time: (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes(),
      premium: rideScore,
    };
    // console.log('updatePremium: ' + JSON.stringify(event));
    ref.child(userId).child('feed').push(event);
  },

  stateChanged: function(userId, newState) {
    var date = new Date();
    var event = {
      type:'stateChanged',
      time: (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes(),
      newState: newState
    };

    // console.log('stateChanged: ' + JSON.stringify(event));
    ref.child(userId).child('feed').push(event);
  }
};
