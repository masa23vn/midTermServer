const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const http = require("http");
const socketIO = require('socket.io');
require('express-async-errors');
require('./utils/passport');

/*
const corsOptions = {
  cors:true,
  // test
  //origin: "http://localhost:3000"
  //origin: /midterm596.herokuapp\.com$/,
  origin: ["https://midterm596.herokuapp.com/"]
};
*/
const corsOptions = {
  handlePreflightRequest: (req, res) => {
      const headers = {
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
          "Access-Control-Allow-Credentials": true
      };
      res.writeHead(200, headers);
      res.end();
  }
}

const app = express();
const server = http.createServer(app);
const io = socketIO(server, corsOptions);

const ioConfig = require('./utils/server')(io);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// dependency
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
const userRouter = require('./routes/user');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', passport.authenticate('jwt', { session: false }), userRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(9000, () => {
  console.log("server running at port 9000");
});

module.exports = io;