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
var exchanges = ['coinbasepro','bittrex','binance','kraken'];
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
          var active = pair.active;

          if (active){
            if (tickers != ""){
              var ticker = tickers[symbol];
              if (ticker !=undefined){
                if (ex_id=="bittrex"){
                  var pday = ticker.info.PrevDay;
                  var lst = ticker.info.Last;
                  if (pday>0 && lst!=undefined){
                    change = (lst-pday)/pday;
                  }
                } else if (ex_id=="binance"){
                  change = parseFloat(ticker.info.priceChangePercent);
                } else if (ex_id=="upbit"){
                  change = ticker.percentage;
                } else if (ex_id=="kraken"){
                  var pday = ticker.open;
                  var lst = ticker.last;
                  if (pday>0 && lst!=undefined){
                    change = (lst-pday)/pday;
                  }
                }
  
                last = ticker.last;
                base_volume = ticker.baseVolume;
                quote_volume = ticker.quoteVolume
                price = ticker.price;
              }
            }

 
            let index = list.findIndex(o => o.symbol === symbol);
            if (index==-1){
              //  console.log(change,ex_id,symbol);
                list.push({id:id, symbol:symbol, base:base, quote:quote, exchange:[{id:ex_id,sym:id,bVol:base_volume,qVol:quote_volume,price:price,active:active}], change:change, last:last});
            } else {
                list[index].exchange.push({id:ex_id,sym:id,bVol:base_volume,qVol:quote_volume,price:price,active:active});
                var change_before = list[index].change;
                if(change_before==0){
                  list[index].change = change;
                  list[index].last = last;
                //  console.log(change,ex_id,symbol);
                }
            }
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
    var qicon = "";
    var qname = "";

    Coin.find({symbol:{$in:[coin.base,coin.quote]}},function(err,item){
      if (item.length>0){
        for(var i=0;i<item.length;i++){
          var sym = item[i].symbol;
          var icn = item[i].icon;
          var nm = item[i].name;
          if (sym==coin.base){
            icon_url = icn;
            name = nm;
          } else if (sym==coin.quote){
            qicon = icn;
            qname = nm;
          }
        }
        pushCoin(coin, name, icon_url, qicon, qname);
      } else {
        pushCoin(coin,"", "","","");
      }
    });  

  });
}

function pushCoin(coin, name, icon, qicon, qname){
  var query = {symbol:coin.symbol},
  update =  {id:coin.id, base:coin.base, quote:coin.quote, name:name,
            exchange:coin.exchange, change:coin.change, last:coin.last, 
            icon:icon, quote_icon:qicon, quote_name:qname},
  options = { upsert: true, new: true, setDefaultsOnInsert: true };

  TradeCoin.findOneAndUpdate(query, update, options, function(error, result) {
      if (error) return;
     // console.log('added symbol '+coin.symbol)
  });
}