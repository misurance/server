var bodyParser = require('body-parser');

module.exports = function(app){
  var braintree = require("braintree");
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "w7vpqnt9bfgb68hr",
    publicKey: "pv356yjm6zxhfcgf",
    privateKey: "c0b1d94d789c8c5c446b7a5d6778ff7a"
  });

  app.get("/api/client_token", function (req, res) {
    gateway.clientToken.generate({}, function (err, response) {
      res.send(response.clientToken);
    });
  });

  app.post("/api/checkout", function (req, res) {
    // console.log(req.body);
    var nonce = req.body.payment_method_nonce;
    // Use payment method nonce here
    console.log(nonce);
    res.send('ok')
  });
};
