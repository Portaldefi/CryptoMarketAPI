
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
        let exchange = new ccxt[exchange_id]({'enableRateLimit': true});
        if (exchange.has.fetchOHLCV) {
            (async () => {
                try {
                    let markets = await exchange.fetchMarkets();
                    if (markets !=undefined){
                        for (var m=0;m<markets.length;m++) {
                            var symbolObj = markets[m];
                            await sleep (exchange.rateLimit) 
                            for (var j=0; j<intervals.length;j++){
                                await sleep (exchange.rateLimit) 
                                let data = await exchange.fetchOHLCV (symbolObj.symbol, intervals[j]);
                                addData(symbolObj.base,symbolObj.quote,data,intervals[j],exchange_id);
                            }
                        }
                    }
                } catch(error){
                    console.log(error)
                }
            }) ()
            next();
        }

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
               // console.log(err);
            }
        );
    } else if (interval=="1h"){
        OHLCV.updateMany(
            query,
            { '$set': { hour:data }},
            { multi: true , upsert:true},
            function(err) {
               // console.log(err);
            }
        );
    } else if (interval=="1d"){
        OHLCV.updateMany(
            query,
            { '$set': { days:data }},
            { multi: true , upsert:true},
            function(err) {
               // console.log(err);
            }
        );
    }


}

