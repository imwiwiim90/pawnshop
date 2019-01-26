var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('new_transaction',{
  	auth: req.isAuthenticated(),
  });
});

module.exports = router;