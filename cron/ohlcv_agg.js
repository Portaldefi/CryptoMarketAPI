
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
var OHLCVA = require('../models/OHLCVA');

OHLCV.aggregate([
    { $unwind: '$min' },
    {
        $group:{
            _id : {fsym:'$fsym', tsym:'$tsym'},
            ex:{$addToSet:'$exchange'},
            arr:{$addToSet:'$min'},
        }
    }
],
function(err,results) {
    var tdata = minArr(results, "min");
    addHour();
});

function addHour(){
    OHLCV.aggregate([
        { $unwind: '$hour' },
        {
            $group:{
                _id : {fsym:'$fsym', tsym:'$tsym'},
                ex:{$addToSet:'$exchange'},
                arr:{$addToSet:'$hour'},
            }
        }
    ],
    function(err,results) {
        var tdata = minArr(results, "hour");
        addDay();
    });
}

function addDay(){
    OHLCV.aggregate([
        { $unwind: '$days' },
        {
            $group:{
                _id : {fsym:'$fsym', tsym:'$tsym'},
                ex:{$addToSet:'$exchange'},
                arr:{$addToSet:'$days'},
            }
        }
    ],
    function(err,results) {
        var tdata = minArr(results, "days");
        console.log("Finished!")
    });
}

function minArr(results, interval){
    var tdata = [];
    for (var i=0;i<results.length;i++){
        var res = results[i];
        var fsym = res._id.fsym;
        var tsym = res._id.tsym;
        var arr = res.arr;
        var data = [];
        var max = arr.map(value => ({'time': parseInt(value[0]), 'open':parseFloat(value[1]),'last':parseFloat(value[2]),
        'high':parseFloat(value[3]),'close':parseFloat(value[4]),'vol':parseFloat(value[5])}));
        var group_time = groupBy(max, (c) => c.time);

        for(var sym in group_time){
            var price = group_time[sym];
            var t = price[0].time;
            var o =[]; var l= []; var c=[]; var h=[];var v=[];
            for (var k=0; k<price.length; k++){
                o.push(price[k].open);
                h.push(price[k].high);
                l.push(price[k].last);
                c.push(price[k].close);
                v.push(price[k].vol);
            }
            data.push({time:t, vol:v.reduce(add, 0), open:avg(o),
            last:avg(l), high:avg(h), close:avg(c)});
        }
        addData(fsym, tsym, interval, res.ex, data);
        
    }
    return tdata
}

function groupBy(xs, f) {
    return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
}

function add(a, b) {
    return a + b;
}

function avg(a) {
    return a.reduce(add, 0)/a.length;
}

function addData(base,quote,interval,exchange,data){
    var query = {fsym:base,tsym:quote,interval:interval};
    OHLCVA.updateMany(
        query,
        { '$set': { price:data, exchange:exchange }},
        { multi: true , upsert:true},
        function(err) {
           // console.log(err);
        }
    );
}