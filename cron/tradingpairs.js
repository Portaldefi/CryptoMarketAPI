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

var TradeCoin = require('../models/TradeCoin');
var Coin = require('../models/Coin');
var exchanges = ['gdax','huobi','bittrex','binance'];
var ccxt = require ('ccxt');

getExchange();

function getExchange(){
  var list = [];
  
  (async () => {  
    
    for(var i=0;i<exchanges.length;i++){
      var ex_id = exchanges[i];
      let exchange = new ccxt[ex_id] ();
      let markets = await exchange.loadMarkets();
      let tickers = [];
      
      if (exchange.has['fetchTickers']){
        tickers = await exchange.fetchTickers();
      }
      
      for(var symb in markets){
          var pair = markets[symb];
          var id = pair.id;
          var symbol = pair.symbol;
          var base = pair.base;
          var quote = pair.quote;
          var change = 0.0;
          var last = 0.0;
          var quote_volume = 0.0;
          var base_volume = 0.0;
          var price = 0.0;
          
          if (tickers != ""){
            var ticker = tickers[symbol];
            if (ticker !=undefined){
              if (ex_id=="bittrex"){
                var pday = ticker.info.PrevDay;
                var lst = ticker.info.last;
                if (pday>0 && lst!=undefined){
                  change = (lst-pday)/pday;
                }
              } else if (ex_id=="binance"){
                change = parseFloat(ticker.info.priceChangePercent);
              }

              last = ticker.last;
              base_volume = ticker.baseVolume;
              quote_volume = ticker.quoteVolume
              price = ticker.price;
            }
          }

          if (ex_id=="binance" && base=="BCH"){
            base = "BCHABC";
            id = "BCHABC"+id.substr(3);
          }

          let index = list.findIndex(o => o.symbol === symbol);
          if (index==-1){
            //  console.log(change,ex_id,symbol);
              list.push({id:id, symbol:symbol, base:base, quote:quote, exchange:[{id:ex_id,sym:id,bVol:base_volume,qVol:quote_volume,price:price}], change:change, last:last});
          } else {
              list[index].exchange.push({id:ex_id,sym:id,bVol:base_volume,qVol:quote_volume,price:price});
              var change_before = list[index].change;
            //  if(change>change_before){
                list[index].change = change;
                list[index].last = last;
              //  console.log(change,ex_id,symbol);
            //  }
          }

      }
    }
    addCoin(list);
  }) ()

}

function addCoin(coins){
  async.each(coins, function(coin, callback) {
    var icon_url = "";
    var name = "";

    Coin.find({symbol:coin.base},function(err,item){
      if (item.length>0){
        icon_url = item[0].icon;
        name = item[0].name;
        pushCoin(coin, name, icon_url);
      } else {
        pushCoin(coin, "", "");
      }
    });  
  });
}

function pushCoin(coin, name, icon){
  var query = {id:coin.id},
  update =  {symbol:coin.symbol, base:coin.base, quote:coin.quote, name:name,
            exchange:coin.exchange, change:coin.change, last:coin.last, icon:icon},
  options = { upsert: true, new: true, setDefaultsOnInsert: true };

  TradeCoin.findOneAndUpdate(query, update, options, function(error, result) {
      if (error) return;
     // console.log('added symbol '+coin.symbol)
  });
}