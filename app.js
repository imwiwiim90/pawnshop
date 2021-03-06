var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
const FileStore = require('session-file-store')(session);

var index = require('./routes/views/index');
var new_transaction = require('./routes/views/new_transaction');
var view_product = require('./routes/views/product');
var view_client = require('./routes/views/client');
var login = require('./routes/session');
var users = require('./routes/api/users');

var client = require('./routes/api/client');
var product = require('./routes/api/product');
var transaction = require('./routes/api/transaction');


// authentication

const LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');


passport.use(new LocalStrategy(
  { usernameField: 'username' },
  (username, password, done) => {
    let user = new User();
    user.set({ username: username})
      .get((users) => {
        console.log(users);
        if (users && users.length > 0) {
          let user = users[0]
          if (user.username == username && user.password == password)
            return done(null,user);
          else
            return done(null,false);
        } else {
          return done(null,false);
        }
      });
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  let user = new User();
  user.set({id: id}).get((user) => {
    if (user) {
      done(null,user);
    } else {
      done(null,false);
    }
  });
}); 

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// 304 problem
app.disable('etag');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/', login);
app.use('/new_transaction',new_transaction);
app.use('/product',view_product);
app.use('/client',view_client);

app.use('/api/client/',client);
app.use('/api/product/',product);
app.use('/api/transaction/',transaction);
app.use('/api/users', users);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
