'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
// const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
// const jwt        = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config     = require('./config');
const metaMaskAuth = require('./controllers/metamask-auth');
// const rateLimit = require("express-rate-limit");

const routes = require('./routes/index');

const app = express();

mongoose.connect(config.mongo.uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// user authentication using jwtToken
app.use('/api', expressJwt({secret: config.jwt.jwtSecret}));
app.use('/internal', expressJwt({secret: config.jwt.jwtSecret}));
app.use(function(err, req, res, next){
  if (err.constructor.name === 'UnauthorizedError') {
    res.status(401).send('Unauthorized');
  }
});
// make sure userAddress and networkId params match those in header
// app.use('/api', metaMaskAuth.validateHeaderParams);

app.use('/', routes);

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
  if (req.app.get('env') === 'development') {
    res.send('Internal Sever Error: ' + err.toString());
  }
  else {
    res.send('Internal Sever Error');
  }
});

module.exports = app;
