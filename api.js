var bodyParser = require('body-parser');

var customersStorage = [];

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

  app.post("/api/create_customer", function (req, res) {
    gateway.customer.create({
      firstName: "anonymous",
      lastName: "anonymous",
      paymentMethodNonce: req.body.nonce
    }, function (err, result) {
      if (err) {
        res.status(500).send(err);
      }
      else {
        customersStorage.push({id: req.body.userId, braintreeDetails: result.customer})
        res.send(result);
      }
    });
  });

  app.post("/api/transaction", function (req, res) {
    var customer = customersStorage.filter((customer) => customer.id == req.body.userId)[0];

    gateway.transaction.sale({
      amount: req.body.amount,
      customerId: customer.braintreeDetails.id
    }, function (err, result) {
      if (err) {
        res.status(500).send(err);
      }
      else {
        res.send(result);
      }
    });
  });
};
