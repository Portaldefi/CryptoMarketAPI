
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

var OHLCV = require('../models/OHLCV');

OHLCV.aggregate([
    {$match:{"fsym":"BTC"}},
    {
        $group:{
            _id : { fsym:'$fsym'}
        }
    }
],
function(err,results) {
    console.log(results);
});