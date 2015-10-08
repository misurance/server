module.exports = function(app){

  app.get('/api/token', function(req, res){
    res.send('<h1>Hello world</h1>');
  });
};
