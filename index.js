var koa = require('koa.io');

var app = koa();

// middleware for koa
app.use(function*() {
});


// middleware for scoket.io's connect and disconnect
app.io.use(function* (next) {
  // on connect
  yield* next;
  // on disconnect
});

// router for socket event
app.io.route('LocationUpdate', function* () {

});

app.listen(3000);
