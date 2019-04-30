var ccxt = require ('ccxt');
var TradeCoin = require('../models/TradeCoin');
var Coin = require('../models/Coin');


exports.list = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var list = [{exchange:"Binance", id:"binance", icon:"https://cryptomarket-api.herokuapp.com/images/binance.png"},
                {exchange:"Bittrex", id:"bittrex", icon:"https://cryptomarket-api.herokuapp.com/images/bittrex.png"},
                {exchange:"Coinbase Pro", id:"coinbasepro", icon:"https://cryptomarket-api.herokuapp.com/images/gdax.png"},
                {exchange:"Kraken", id:"kraken", icon:"https://cryptomarket-api.herokuapp.com/images/kraken.png"}
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
            {$match: { "exchange.id": { "$in": ex} },},
            {  
                $group: {
                    _id: '$id',
                    exchange: { $push: "$exchange" },
                    data : {"$first" : "$$ROOT"}
                },
            },
            {$project : {
                    icon : "$data.icon",
                    name : "$data.name",
                    base : "$data.base",
                    quote : "$data.quote",
                    quote_icon : "$data.quote_icon",
                    quote_name : "$data.quote_name",
                    symbol : "$data.symbol",
                    change : "$data.change",
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
    var assets=[];
    TradeCoin.find({}).select('base quote -_id').exec( function(err, doc) {   
       for(var i= 0; i<doc.length;i++){
           var coin = doc[i];
           var base = coin.base;
           var quote = coin.quote;
           assets.push(base);
           assets.push(quote);
           if (i==doc.length-1){
                var uniqueAssets = Array.from(new Set(assets))
                Coin.find({symbol:{$in:uniqueAssets}}).select('name symbol icon -_id').exec(function(err,assts){
                    res.status(200).json(assts);
                })
           }
       }
   });
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
                _id:0,
            }
        }
        ],
        function(err,results) {
            var res = results[0];
            if (res!=undefined){
                sym = res.base+res.quote;
            }
        }
    )

   res.render('tv',{id:sym});
}

function sendError(e){
    return {'name': e.constructor.name, "msg":e.toString()}
}