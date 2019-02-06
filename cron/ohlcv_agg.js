
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;
mongoose.connection
    .on('connected', () => {
    console.log(`Mongoose connection open on ${process.env.DATABASE}`);
})
.on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
});

global.fetch = require('node-fetch');
var asyncLoop = require('node-async-loop');
var moment = require('moment');
var ccxt = require('ccxt');


var OHLCV = require('../models/OHLCV');
var intervals = ['1m','1h','1d'];
var symbols = ['USD'];

OHLCV.aggregate([
    {
        $group:{
            _id : { fsym:fsym}
        }
    }
])