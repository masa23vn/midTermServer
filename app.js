const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
require('express-async-errors');
require('./utils/passport');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// dependency
var corsOptions = {
  //origin: "http://localhost:3000"
  origin: "https://midterm596.herokuapp.com/"
};
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// router
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const boardRouter = require('./routes/board');
const userRouter = require('./routes/user');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/board', passport.authenticate('jwt', {session: false}), boardRouter);
app.use('/user', passport.authenticate('jwt', {session: false}), userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
