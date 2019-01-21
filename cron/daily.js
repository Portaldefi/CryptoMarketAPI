
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

var Daily = require('../models/Daily');
var Coin = require('../models/Coin');

Coin.find({}, function(err, coins) {
  if (err) throw err;
        asyncLoop(coins, function (item, next)
        {
            var fsym = item.symbol;
            findandUpdate(fsym, function() {
            //    console.log('added '+fsym);
                next();
            });
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

function findandUpdate(fsym, callback){
        cc.histoDay(fsym,'USD',{limit:1})
        .then(data => {
            
            asyncLoop(data, function (item, next)
            {
                Daily.update(
                    {fsym:fsym},
                    { '$addToSet': { price: item } },
                    { multi: true , upsert:true},
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
            console.log(error);
            callback();
        });     
}
