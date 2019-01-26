var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.sessionID)
  res.render('index',{
  	auth: req.isAuthenticated(),
  });
});


module.exports = router;
