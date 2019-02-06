
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


var OHLCV = require('../models/OHLCV');
var intervals = ['1m','1h','1d'];

var exchanges = ccxt.exchanges;
let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));

for (var i=0;i<exchanges.length;i++){
    var exchange_id = exchanges[i];
    (async () => {

    let exchange = new ccxt[exchange_id]();

        try{
            if (exchange.has.fetchOHLCV) {
                for (symbol in exchange.markets) {
                    console.log(symbol)
                    await sleep (exchange.rateLimit) 
                    for (var j=0; j<intervals.length;j++){
                        await sleep (exchange.rateLimit) 
                        let data = await exchange.fetchOHLCV (symbol, intervals[j]);
                        let symb = exchange.markets[symbol];
                        if (symb !=undefined){
                            let base = symb.base;
                            let quote = symb.quote;
                            addData(base,quote,data,intervals[j],exchange_id);
                        }
                    }
                }
            }
        } catch(error){
            console.log(error)
        }

    }) ()

}

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

