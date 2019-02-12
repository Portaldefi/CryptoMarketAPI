
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
var ccxt = require('ccxt');
var asyncLoop = require('node-async-loop');

var OHLCV = require('../models/OHLCV');
var intervals = ['1m','1h','1d'];

var exchanges = ccxt.exchanges;
let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));

asyncLoop(exchanges, function (exchange_id, next)
    {
        (async () => {
            let exchange = new ccxt[exchange_id]({'timeout': 60000});
            if (exchange.has.fetchOHLCV) {
                await exchange.fetchMarkets()
                .then(function(markets){
                    if (markets !=undefined){
                        asyncLoop(markets, function (symbolObj, callback)
                        {   
                            asyncLoop(intervals, function (interval, next_interval){
                                (async () => {
                                    await sleep (exchange.rateLimit*2).then(function(){
                                        (async () => {
                                            await exchange.fetchOHLCV (symbolObj.symbol, interval)
                                            .then(function(data){
                                                console.log(symbolObj.base,symbolObj.quote,interval,exchange_id)
                                                addData(symbolObj.base,symbolObj.quote,data,interval,exchange_id);
                                                next_interval();
                                            })
                                            .catch(function(error) {
                                                console.log(error)
                                                var error_type = error.constructor.name;
                                                if (error_type=="RequestTimeout" || error_type=="ExchangeError" || error_type=="ExchangeNotAvailable"){
                                                    next();
                                                   // return;
                                                } else {
                                                    callback();
                                                }
                                            }); 
                                        }) ()  
                                    })
                                    if(interval=="1d"){
                                        callback();
                                    }
                                }) ()  
                            }, function (err){
                                if (err){
                                    callback();
                                }
                            });
                        }, function (err)
                        {
                            if (err)
                            {
                                console.error('Error: ' + err.message);
                                return;
                            }
                        });
                    }
                    next();
                })
                .catch(function(error) {
                   next();
                });
                
            } else{
                next();
            }
        }) ()
    }, function (err)
    {
        if (err)
        {
            console.error('Error: ' + err.message);
            return;
        }
        console.log('Finished!');
    });



function addData(base,quote,data,interval,exchange){
    var query = {fsym:base,tsym:quote,exchange:exchange};

    if (interval=="1m"){
        OHLCV.updateMany(
            query,
            { '$set': { min:data }},
            { multi: true , upsert:true},
            function(err) {
             //   console.log(err);
            }
        );
    } else if (interval=="1h"){
        OHLCV.updateMany(
            query,
            { '$set': { hour:data }},
            { multi: true , upsert:true},
            function(err) {
             //   console.log(err);
            }
        );
    } else if (interval=="1d"){
        OHLCV.updateMany(
            query,
            { '$set': { days:data }},
            { multi: true , upsert:true},
            function(err) {
            //    console.log(err);
            }
        );
    }


}

