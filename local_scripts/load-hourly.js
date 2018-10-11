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

var Hourly = require('../models/Hourly');
var Coin = require('../models/Coin');

Coin.find({}, function(err, coins) {
  if (err) throw err;
        asyncLoop(coins, function (item, next)
        {
            var fsym = item.symbol;
            addData(fsym, function() {
                console.log('added '+fsym);
                next();
            });
            // findandUpdate(fsym, function() {
            //     console.log('added '+fsym);
            //     next();
            // });
        }, function (err)
        {
            if (err)
            {
                console.error('Error: ' + err.message);
                return;
            }
            console.log('Finished!');
        });

});

function addData(fsym,callback){
    cc.histoHour(fsym,'USD',{limit:100})
    .then(data => {
        var price = new Hourly({fsym:fsym, tsym:'USD', price:data})
        price.save(function (err) { 
            if (err) {
                console.log(err); 
            } else {
                callback();
            }
        });
        // Daily.findOneAndUpdate({ fsym: fsym }, { $set: {fsym:fsym, tsym:'USD', price:data} }, { new: true }, function(err, doc) {
        //     callback();
        // });
    }).catch((error) => {
        console.log(error);
        callback();
    });  
}

function findandUpdate(fsym, callback){
        cc.histoDay(fsym,'USD',{limit:1})
        .then(data => {
            
            asyncLoop(data, function (item, next)
            {
                Hourly.update(
                    {fsym:fsym},
                    { '$addToSet': { price: item } },
                        function(err, model) {
                            console.log(err);
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
                console.log('Finished!');
                callback();
            });

        }).catch((error) => {
            console.log(error.message);
        });     
}
