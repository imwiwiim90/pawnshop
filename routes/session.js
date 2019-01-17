var express = require('express');
var router = express.Router();
var passport = requier('passport');
var Client = require('../../models/client');

router.get('/login', function(req, res, next) {
  res.render('login');

router.post('/login', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (info) { return res.send(info.message)}
    if (err) { return next(err); }
    if (!user) { return res.send('auth failed'); }
    req.login(user, (err) => {
      if (err) { return next(err); }
      return res.redirect('/');
    })
  })(req, res, next);
});


module.exports = router;
