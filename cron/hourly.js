
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
const cc = require('cryptocompare');
//cc.setApiKey('af16475c85c4892bc3ebd78cda62808e0b6685faa7bcee2c3e4908036dbf85be')

var asyncLoop = require('node-async-loop');
var moment = require('moment');

var Hourly = require('../models/Hourly');
var Coin = require('../models/Coin');
var OHLCVC = require('../models/OHLCVC');
var limit_time = moment().utc().subtract(1,'days').unix('X');

Coin.find({}, function(err, coins) {
  if (err) throw err;
        asyncLoop(coins, function (item, next)
        {
            var fsym = item.symbol;
            if (!dataexists(fsym)){
                findandUpdate(fsym, function() {
                    next();
                });
            } else { console.log(fsym)}
        }, function (err)
        {
            if (err)
            {
            //    console.error('Error: ' + err.message);
                return;
            }
        //    console.log('Finished!');
        });

});

function findandUpdate(fsym, callback){
    cc.histoHour(fsym,'USD',{limit:120})
    .then(data => {
        pushCoin(fsym, 'USD', data);
        callback();
    }).catch((error) => {
        console.log(error)
        callback();
    });      
}

function dataexists(fsym){
    OHLCVC.find({fsym:fsym}, function(err, results){
        if (results!=null){
            return true
        } else{
            return false
        }
    })
}

function pushCoin(fsym, tsym, price){
    var query = {fsym:fsym},
    update =  {fsym:fsym, tsym:tsym, price:price},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
  
    Hourly.findOneAndUpdate(query, update, options, function(error, result) {
        if (error) return;
       // console.log('added symbol '+coin.symbol)
    });
}