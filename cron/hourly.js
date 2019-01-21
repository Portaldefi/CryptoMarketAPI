
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

var Hourly = require('../models/Hourly');
var Coin = require('../models/Coin');
var limit_time = moment().utc().subtract(1,'days').unix('X');

Coin.find({}, function(err, coins) {
  if (err) throw err;
        asyncLoop(coins, function (item, next)
        {
            var fsym = item.symbol;
            findandUpdate(fsym, function() {
                // console.log('added '+fsym);
                 next();
            });
        }, function (err)
        {
            if (err)
            {
                console.error('Error: ' + err.message);
                return;
            }
        //    console.log('Finished!');
        });

});

function findandUpdate(fsym, callback){
        cc.histoHour(fsym,'USD',{limit:1})
        .then(data => {

            Hourly.update(
                {fsym:fsym},
                { $pull: { price: { time: { $lt: limit_time} }  } },
                { multi: true},
                function(err) {
                    console.log(err);
                //    next();
                }
            );
            
            asyncLoop(data, function (item, next)
            {
                Hourly.updateMany(
                    {fsym:fsym},
                    { '$addToSet': { price: item } },
                    { multi: true , upsert:true},
                        function(err) {
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
            //    console.log('Finished!');
                callback();
            });

        }).catch((error) => {
            console.log(error);
            callback();
        });     
}
