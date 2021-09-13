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

const CoinMarketCap = require('coinmarketcap-api')
var ExchangeAsset = require('../models/ExchangeAsset');
var Coin = require('../models/Coin');

const async = require('async')
const apiKey = '49e34a49-09c8-450b-ba4b-a8736f1c1be8'
const client = new CoinMarketCap(apiKey)

var exchanges = ['coinbasepro','bittrex','binance','kraken'];
var ccxt = require ('ccxt');

getAssets();

function getAssets(){
    let assets = [];
    
    (async () => {  
      
      for(var i=0;i<exchanges.length;i++){
        var ex_id = exchanges[i];
        let exchange = new ccxt[ex_id] ();
        let markets = await exchange.loadMarkets();

        for(var symb in markets){
            var pair = markets[symb];
            var symbol = pair.base;
            var active = pair.active;
            
            let index = assets.findIndex(o => o.symbol === symbol);
            if (index==-1){
                assets.push({symbol:symbol, exchange:[{id:ex_id,active:active,deposit:true,withdraw:true}]});
            } else {
                var ex_exists = false;
                var ex_list = assets[index].exchange;
                for(var j=0;j<ex_list.length;j++){
                    var ex = ex_list[j];
                    if(ex_id==ex.id){
                        ex_exists = true;
                    }
                }
                if (!ex_exists){
                    assets[index].exchange.push({id:ex_id,active:active,deposit:true,withdraw:true});
                }
            }
        }
      }
      addCoin(assets);
    }) ()
  
  }
  
  function addCoin(coins){
    async.each(coins, function(coin, callback) {
      var icon = "";
      var name = "";
      var symbol = coin.symbol;
      var id = "";
      var exchange = coin.exchange;
  
      Coin.find({symbol:{$in:[symbol]}},function(err,item){
        if (item.length>0){
          for(var i=0;i<item.length;i++){
            icon = item[i].icon;
            name = item[i].name;
            id = item[i].id;
          }
          pushCoin(id,symbol,exchange,name,icon);
        } else {
        //  pushCoin(coin,"", "","","");
        }
      });  
    });
  }
  
function pushCoin(id,symbol,exchange,name,icon){
    var query = {symbol:symbol},
    update =  {id:id,symbol:symbol,name:name,icon:icon,exchange:exchange},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

    ExchangeAsset.findOneAndUpdate(query, update, options, function(error, result) {
        if (error) return;
        // console.log('added symbol '+coin.symbol)
    });
}


