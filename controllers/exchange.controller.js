var ccxt = require ('ccxt');
var TradeCoin = require('../models/TradeCoin');
var Coin = require('../models/Coin');
const Codes = require ('../errors/codes');
var ExchangeAsset = require('../models/ExchangeAsset');


exports.list = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var list = [{exchange:"Binance", id:"binance", icon:"https://cryptomarket-api.herokuapp.com/images/binance.png"},
                {exchange:"Bittrex", id:"bittrex", icon:"https://cryptomarket-api.herokuapp.com/images/bittrex.png"},
                {exchange:"Coinbase Pro", id:"coinbasepro", icon:"https://cryptomarket-api.herokuapp.com/images/gdax.png"},
                {exchange:"Kraken", id:"kraken", icon:"https://cryptomarket-api.herokuapp.com/images/Kraken.png"}
            ];        
    res.status(200).json(list);
}

exports.pairs = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var ex = req.query.ex.split(",");

        TradeCoin.aggregate([
            {$match:{"exchange.id":{$in:ex}}},
            {$unwind: "$exchange" },
            {$match: { "exchange.id": { "$in": ex} }},
            {  
                $group: {
                    _id: '$id',
                    exchange: { $push: "$exchange" },
                    data : {"$first" : "$$ROOT"}
                },
            },
            { $match: { "exchange.active": true } },
            {$project : {
                    icon : "$data.icon",
                    name : "$data.name",
                    base : "$data.base",
                    quote : "$data.quote",
                    quote_icon : "$data.quote_icon",
                    quote_name : "$data.quote_name",
                    symbol : "$data.symbol",
                    change : "$data.change",
                    platform: "$data.platform",
                    last : "$data.last",
                    exchange : 1,
                    _id:0,
                    id:"$data.symbol"
                }
            }
            ],
            function(err,results) {
                res.send(JSON.stringify(results));
            }
        )
    }
}

exports.ohlcv = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {

        var sym = String(req.query.sym);
        var ex = req.query.ex;
        var interval = req.query.interval;

        (async () => {
            let exchange = new ccxt[ex] ({'enableRateLimit': true});
            let ohlcv = await exchange.fetchOHLCV (sym, interval)
            .then(function(result){
                res.send(result);
            })
            .catch(function(error) {
                res.send(sendError(error));
            });
        }) ()
    }
}

exports.depth = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var sym = String(req.query.sym);
        var ex = req.query.ex;

        (async () => {
            let exchange = new ccxt[ex] ({'enableRateLimit': true});
            let depth = await exchange.fetchOrderBook(sym)
            .then(function(result){
                res.send(result);
            })
            .catch(function(error) {
                res.send(sendError(error));
            });
        }) ()
    }
}

exports.ticker = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var sym = String(req.query.sym);
        var ex = req.query.ex;

        (async () => {
            let exchange = new ccxt[ex] ({'enableRateLimit': true});
            let depth = await exchange.fetchTicker (sym)
            .then(function(result){
                res.send(result);
            })
            .catch(function(error) {
                res.send(sendError(error));
            });

        }) ()
    }
}

exports.top_coin = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    TradeCoin.find({quote:/USD/}).select('name icon change last -_id').sort({"change": -1}).limit(1).exec( function(err, doc) {   
        res.status(200).json(doc);
   });
}

exports.asset_list = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
//    var assets=[];
//     TradeCoin.find({}).select('base quote -_id').exec( function(err, doc) {   
//        for(var i= 0; i<doc.length;i++){
//            var coin = doc[i];
//            var base = coin.base;
//            var quote = coin.quote;
//            assets.push(base);
//            assets.push(quote);
//            if (i==doc.length-1){
//                 var uniqueAssets = Array.from(new Set(assets))
//                 Coin.find({symbol:{$in:uniqueAssets}}).select('name symbol icon -_id').exec(function(err,assts){
//                     res.status(200).json(assts);
//                 })
//            }
//        }
//    });
    ExchangeAsset.find({}).exec( function(err, doc) {   
        res.status(200).json(doc);
    });
}

exports.error_codes = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(Codes.error_codes);
}

exports.tradingview = (req, res) => {
    var sym = req.query.sym;
    
    TradeCoin.aggregate([
        {$match:{"exchange.sym":sym}},
        {$unwind: "$exchange" },
        {  
            $group: {
                _id: '$id',
                exchange: { $push: "$exchange" },
                data : {"$first" : "$$ROOT"}
            },
        },
        {$project : {
                base : "$data.base",
                quote : "$data.quote",
                exchange:"$data.exchange.id",
                _id:0,
            }
        }
        ],
        function(err,results) {
            var reslts = results[0];
            if (reslts!=undefined){
                var ex="";
                if (reslts.exchange == "binance"){
                    ex="BINANCE:";
                } else if (reslts.exchange == "coinbasepro"){
                    ex="COINBASE:";
                } else if (reslts.exchange == "bittrex"){
                    ex="BITTREX:";
                } else if (reslts.exchange == "kraken"){
                    ex="KRAKEN:";
                }
                sym = ex+reslts.base+reslts.quote;
                res.render('tv',{id:sym});
            }
        }
    )
  
}

function sendError(e){
    return {'name': e.constructor.name, "msg":e.toString()}
}
