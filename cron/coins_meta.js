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


const async = require('async')
const CoinMarketCap = require('coinmarketcap-api')
var Coin = require('../models/Coin');
var TradeCoin = require('../models/TradeCoin');

const apiKey = '49e34a49-09c8-450b-ba4b-a8736f1c1be8'
const client = new CoinMarketCap(apiKey)

addMeta();


function addMeta(symstr){
  client.getTickers({limit: 4000})
  .then(function (response) {
      let data = response.data;
      for(var i=0;i<data.length;i++){
        var val = data[i];

        var query = {base:val.symbol},
        update =  {$set:{platform:val.platform}},
        options = {new: true};
      
        TradeCoin.updateMany(query, update, options, function(error, result) {
            if (error) return;
            console.log('added symbol '+val.symbol)
        });

      }
  })
  .catch(function (error) {
      console.log(error)
  });
}

