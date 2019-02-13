
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
var OHLCVC = require('../models/OHLCVC');

var symbols = ['BTC','ETH'];
var currencies = ['USD'];
var intervals = ['days','hour','min']

getSymbols();

function getSymbols(){
    asyncLoop(intervals, function (interval, next_interval) {
        asyncLoop(symbols, function (symbol, callback) {
            asyncLoop(currencies, function (currency, next) {
                var data_type = symbol+"_"+currency;
                (async () => {
                    await OHLCVA.find({tsym:symbol, interval:interval},function(err, results) {
                        for (var ob=0; ob<results.length; ob++){
                            var data = results[ob];
                            normalizePrice(data_type,data.price,data.fsym,data.interval)
                        }
                    });
                }) ();
                next();
            });
            callback();
        });
        next_interval(); 
    });
}


function normalizePrice(symbol,arr,fsym,interval){ 
    Converter.findOne({symbol:symbol},function(err, results) {
        var price = results.price;
        var d = price.map(function(key,i){
            return key.t/1000;
        });
        var price_mod = [];
        var cnt = 0;
        asyncLoop(arr, function (obj, callback) {
            cnt++;
            var t = obj.time;
            var o = obj.open;
            var l = obj.last;
            var h = obj.high;
            var c = obj.close;
            var v = obj.vol;
            (async () => {
                var nprice = await price[priceClosest(t,d)].l;
                price_mod.push({time:t, open:o*nprice, last:l*nprice, high:h*nprice, close:c*nprice, vol:v});
                if (cnt==arr.length){
                    addData(fsym,'USD',interval,price_mod);
                } 
                callback();
            }) ();
        },function(err){
           
        });
    });
}

function priceClosest(goal, arr){
    // var closest = arr.reduce(function(prev, curr) {
    //     return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
    // });
    var previous = arr[0];
    var closest = previous;
    for (var i = 0; i < arr.length; i++) {
        var current = arr[i];
        var cdiff = Math.abs(current-goal);
        var pdiff = Math.abs(previous-goal);
        if(cdiff<pdiff){
            closest = current;
        }
    }

    var index = arr.indexOf(closest);
    return index;
}

function addData(fsym,tsym,interval,data){
    var query = {fsym:fsym,tsym:tsym,interval:interval};
    OHLCVC.updateMany(
        query,
        { '$set': { price:data}},
        { multi: true , upsert:true},
        function(err) {
            if(err){
                console.log(err);
                return;
            } 
            console.log('added ',fsym)
        }
    );
}
