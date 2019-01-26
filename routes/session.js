var express = require('express');
var router = express.Router();
var passport = require('passport');
var Client = require('../models/client');

router.get('/login', function(req, res, next) {
  console.log('Inside GET /login callback')
  console.log(req.sessionID)
  res.render('login', {
  	auth: req.isAuthenticated(),
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
  	if (user)
    req.login(user, (err) => {
      return res.redirect('/');
    })
	else res.render('login', {
		auth: req.isAuthenticated(),
	});
  })(req, res, next);
})

router.get('/needauth', function(req,res,next) {
	console.log('in need auth');
	if (req.isAuthenticated()) res.send('success');
	else res.send('failure');
});


router.get('/logout', function(req, res, next) {
	console.log(req.user);
	console.log(req.isAuthenticated())
	req.logout();
	res.redirect('/');
});

module.exports = router;
