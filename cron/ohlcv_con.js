
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

var asyncLoop = require('node-async-loop');

var Converter = require('../models/Converter');
var OHLCVA = require('../models/OHLCVA');

var symbols = ['BTC','ETH','USD','XRP','KRW','USDT','PAX','BNB','USDC','TUSD'];
var currencies = ['USD','BTC','ETH'];

getCurrencies();

function getCurrencies(){
    asyncLoop(symbols, function (symbol, callback) {
        asyncLoop(currencies, function (currency, next) {
            var data_type = symbol+"_"+currency;
            var price_obj = [];
            (async () => {
                await OHLCVA.findOne({fsym:symbol, tsym:currency, interval:"days"},function(err, res) {
                    var price = res.price;
                    for(var dt=0; dt<price.length; dt++){
                        price_obj.push({t:price[dt].time,l:price[dt].last});
                     }
                     addToConverter(data_type, price_obj);
                });
                next();
            }) ();
        },function(err){
            if (err)
            {
                console.error('Error: ' + err.message);
                return;
            }
        })
        callback();
    }, function(err){
        if (err)
        {
            console.error('Error: ' + err.message);
            return;
        }
    });
}

function addToConverter(sym, data){
    var query = {symbol:sym};
    Converter.updateMany(
        query,
        { '$set': { price:data}},
        { multi: true , upsert:true},
        function(err) {
           // console.log(err);
        }
    );
}
