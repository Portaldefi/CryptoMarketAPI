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

// Market Data API
const data = require('./controllers/data.controller.js');
app.get('/price_full', data.price_full);
app.get('/price', data.price);
app.get('/histoday', data.history_day);
app.get('/histohour', data.history_hour);
app.get('/histominute', data.history_minute);
app.get('/test', data.test);

// Eth API
const eth = require('./controllers/eth.controller.js');
app.get('/get_tokens', eth.get_tokens);

// Tezos API
const tez = require('./controllers/tez.controller.js');
app.get('/get_tez_txs', tez.get_tez_txs);

// Block API
const block = require('./controllers/block.controller.js');
app.get('/submit_tx', block.submit_tx);
app.get('/address', block.address);
app.get('/utxo', block.utxo);
app.get('/valid', block.valid);
app.get('/explorer_url', block.explorer_url);


// Alerts API
const alert = require('./controllers/alert.controller.js');
app.get('/create_alert', alert.create);
app.get('/delete_alert', alert.delete);
app.get('/register_user', alert.register_user);


// Exchange API
const ex = require('./controllers/exchange.controller.js');
app.get('/exchange/list', ex.list);
app.get('/exchange/pairs', ex.pairs);
app.get('/exchange/ohlcv', ex.ohlcv);
app.get('/exchange/depth', ex.depth);
app.get('/exchange/ticker', ex.ticker);
app.get('/exchange/top_coin', ex.top_coin);
app.get('/exchange/asset_list', ex.asset_list);
app.get('/exchange/tradingview', ex.tradingview);
app.get('/exchange/error_codes', ex.error_codes);

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
