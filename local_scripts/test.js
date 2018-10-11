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

const moment = require('moment');
var Daily = require('../models/Daily');

var et = moment().utc().subtract(0,'days').startOf('day').unix('X');
var st = moment().utc().subtract(10,'days').startOf('day').unix('X')

// Daily.find({"fsym": { $in: ['BTC','BCH'] }}, {price: { $elemMatch: { time: { $gte:st} }}}, 
// function(err, data) {
//     if (err) throw err;
//     console.log(data[1].price)
// });
Daily.aggregate([
    {$match: {fsym: { $in: ['BTC','BCH'] }}},
    {$unwind: "$price"},
    {'$match' : {'price.time': {'$gte': st }}},
    { $group : { _id : '$fsym',  data: { $push: "$price" } } }
    ],
    function(err,results) {
        var json = [];
        for (var i=0;i<results.length;i++){
            var obj = results[i];
            var sym = obj._id;
            var dt = obj.data;
            var info = {};
            info[sym] = dt;
            json.push(info)
        }
        console.log(json);
    }
  )