var Firebase = require("firebase");
var ref = new Firebase("https://intense-inferno-8553.firebaseio.com").child("events");
var messages = [
  'Entered dangerous area',
  'Accident happened nearby',
  'Exited dangerous area',
  'Over the speed limit'
]
setInterval(function(){
  var date = new Date();
  var event = {
   time: date.getHours() + ':' + date.getMinutes(),
   message: messages[Math.floor((Math.random() * messages.length))],
   change: Math.floor((Math.random() * 3) - 1 )
 }
 // console.log(event);
  ref.push().set(event);
},2500);
