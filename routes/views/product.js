var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/id/:id', function(req, res, next) {
  res.render('product');
});

module.exports = router;