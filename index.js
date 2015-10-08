var io = require('socket.io')(process.env.PORT || 5000);

io.on('connection', function(socket){
  var loggedInUser = null;
  socket.on('login', (username)=>
    loggedInUser = username
  );

  socket.on('location update', (time,location)=>{

  });

  socket.on('speed update', (time, speed)=>{

  });

  socket.on('emergency brake', (time, severity)=>{

  });



});
