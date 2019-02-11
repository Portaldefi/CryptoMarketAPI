
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
    {
        $group:{
            _id : {fsym:'$fsym', tsym:'$tsym'},
            min_arr:{$push:'$min'},
            ex:{$push:'$exchange'}
        }
    }
],
function(err,results) {
    console.log(results);
    for (var i=0;i<results.length;i++){
        var res = results[i];
    }
});