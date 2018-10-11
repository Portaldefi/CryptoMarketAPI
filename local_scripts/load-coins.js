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
  console.log(coins.length);
  async.each(coins, function(item, callback) {
    setTimeout(function(){
      var url = "https://www.cryptocompare.com"+item.icon;
      var cobj = {id:item.id, name:item.name, symbol:item.symbol, icon:url};
      var co = new Coin(cobj);
      co.save(function (err) {
          console.log(err);
      });
      console.log('added '+item.symbol);
    }, 500);
  });
}).catch(console.error)


  // Coin.find({}, function(err, coin) {
  //   if (err) throw err;
  //   for (var i in coin) {
  //     var url = coin[i].icon;

  //     cloudinary.v2.uploader.upload(url, 
  //           {timeout:60000},
  //           function(error, result) {
  //         url = result.url;
  //         coin[i].icon = url;
  //         coin[i].save();
  //         console.log('updated '+coin[i].symbol);
  //     });

  //   } 
  // }); 