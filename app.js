var createError = require('http-errors');
var express = require('express');
var path = require('path');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

// Eth API
const eth = require('./controllers/eth.controller.js');
app.get('/erc20_token_list', eth.erc20_list);

// Alerts API
const alert = require('./controllers/alert.controller.js');
app.get('/create_alert', alert.create);
app.get('/delete_alert', alert.delete);
app.get('/register_user', alert.register_user);
app.get('/mock_notifier', alert.mock_notifier);


// Exchange API
const ex = require('./controllers/exchange.controller.js');
app.get('/exchange/list', ex.list);
app.get('/exchange/pairs', ex.pairs);
app.get('/exchange/top_coin', ex.top_coin);
app.get('/exchange/asset_list', ex.asset_list);
app.get('/exchange/tradingview', ex.tradingview);
app.get('/exchange/error_codes', ex.error_codes);
app.get('/exchange/kraken_withdraw_fees', ex.withdraw_fees);


// Welcome page
app.get('/', function(req, res) {
    res.render('index');
});


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
