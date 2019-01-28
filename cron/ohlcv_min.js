
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
var asyncLoop = require('node-async-loop');
var moment = require('moment');

var OHLCV = require('../models/OHLCV');
var TradeCoin = require('../models/TradeCoin');
var limit_time = moment().utc().subtract(720,'minutes').unix('X');


TradeCoin.find({},function(err,items){
    for(var i=0;i<items.length;i++){
        var coin = items[i];
        findandUpdate(coin.base, coin.quote, coin.exchange);
    }
});

function findandUpdate(fsym, tsym, ex, callback){

    cc.histoMinute(fsym, tsym, {limit:1})
    .then(data => {

        OHLCV.update(
            {fsym:fsym,tsym:tsym, exchange:"Avg", interval:"min"},
            { $pull: { price: { time: { $lt: limit_time} }  } },
            { multi: true},
            function(err) {
                //console.log(err);
               // next();
            }
        );

        asyncLoop(data, function (item, next)
        {
            OHLCV.updateMany(
                {fsym:fsym,tsym:tsym, exchange:"Avg", interval:"min"},
                { '$addToSet': { price: item } },
                { multi: true , upsert:true},
                function(err) {
                //    console.log(err);
                    next();
                }
            );
        }, function (err)
        {
            if (err)
            {
                console.error('Error: ' + err.message);
                return;
            }
           console.log(fsym,tsym,'Finished!');
        });

    }).catch((error) => {
        console.log(fsym,tsym,error);
    });  

}