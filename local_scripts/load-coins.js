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
var cloudinary = require('cloudinary');
const cc = require('cryptocompare');
const async = require('async')

cloudinary.config({ 
  cloud_name: 'hirv2zahw', 
  api_key: '929586181465787', 
  api_secret: '8JIV4YWJlnxTqvbv6xVxzYV472U' 
});

var Coin = require('../models/Coin');

cc.coinList()
.then(coinList => {
  var coins = [];

  for (var i in coinList.Data){
    var coin = coinList.Data[i];
    var symbol = coin.Symbol;
    var name = coin.CoinName;
    var icon = coin.ImageUrl;
    var id = parseInt(coin.Id);
    coins.push({id:id, name:name, symbol:symbol, icon:icon});
  }
  
  async.each(coins, function(item, callback) {
    setTimeout(function(){
      var url = "https://www.cryptocompare.com"+item.icon;
      var cobj = {id:item.id, name:item.name, symbol:item.symbol, icon:url};
      var coin = new Coin(cobj);
      var options = { upsert: true, new: true, setDefaultsOnInsert: true };

      Coin.findOneAndUpdate({id:item.id}, coin, options, function(error, result) {
        if (error) return;
        console.log('added symbol '+result.id);
      });
      
    }, 500);
  });
}).catch(console.error)

