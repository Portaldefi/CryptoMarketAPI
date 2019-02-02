var ccxt = require ('ccxt');
var TradeCoin = require('../models/TradeCoin');


exports.list = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var list = [{exchange:"Binance", id:"binance", icon:"https://cryptomarket-api.herokuapp.com/images/binance.png"},
                // {exchange:"Kraken", id:"kraken", icon:"https://cryptomarket-api.herokuapp.com/images/Kraken.png"},
                {exchange:"Bittrex", id:"bittrex", icon:"https://cryptomarket-api.herokuapp.com/images/bittrex.png"},
                // {exchange:"Huobi", id:"huobipro", icon:"https://cryptomarket-api.herokuapp.com/images/huobi.png"},
                {exchange:"Coinbase Pro", id:"gdax", icon:"https://cryptomarket-api.herokuapp.com/images/gdax.png"}
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
                    id:"$data.id"
                }
            }
            ],
            function(err,results) {
                res.send(JSON.stringify(results));
            }
        )
    }
}

exports.get_balance = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var api = req.query.apiKey;
        var secret = req.query.secretKey;
        var ex = req.query.ex;

        (async () => {
            let exchange = new ccxt[ex] ({
                'apiKey': api,
                'secret': secret,
                'enableRateLimit': true
            });
            let markets = await exchange.fetchBalance()
            .then(function(result){
                res.send(result);
            })
            .catch(function(error) {
                res.send(sendError(error));
            });
        }) ()
    }
}

exports.get_orders = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var api = req.query.apiKey;
        var secret = req.query.secretKey;
        var ex = req.query.ex;
        var ticker = req.query.sym;

        (async () => {
            let exchange = new ccxt[ex] ({
                'apiKey': api,
                'secret': secret,
                'enableRateLimit': true
            });
            let markets = await exchange.fetchOrders(ticker)
            .then(function(result){
                res.send(result);
            })
            .catch(function(error) {
                res.send(sendError(error));
            });
        }) ()
    }
}


exports.place_order = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var api = req.query.apiKey;
        var secret = req.query.secretKey;

        var type = req.query.type;
        var sym = String(req.query.sym);
        var ex = req.query.ex;
        var price = req.query.price;
        var amount = req.query.amount;

        (async () => {
            let exchange = new ccxt[ex] ({
                apiKey: api,
                secret: secret,
                'enableRateLimit': true
            });

            if (type=="MarketSell"){
               let json = await exchange.createMarketSellOrder (sym, amount)
               .then(function(result){
                    res.send(result);
                })
                .catch(function(error) {
                    res.send(sendError(error));
                });
            } else if (type=="MarketBuy") {
                await exchange.createMarketBuyOrder (sym, amount)
                .then(function(result){
                    res.send(result);
                })
                .catch(function(error) {
                    res.send(sendError(error));
                });
            } else if (type=="LimitSell") {
                await exchange.createLimitBuyOrder (sym, amount, price)
                .then(function(result){
                    res.send(result);
                })
                .catch(function(error) {
                    res.send(sendError(error));
                });
            } else if (type=="LimitBuy") {
                await exchange.createLimitBuyOrder (sym, amount, price)
                .then(function(result){
                    res.send(result);
                })
                .catch(function(error) {
                    res.send(sendError(error));
                });
            }
            
        }) ()
    }
}

exports.cancel_order = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var api = req.query.apiKey;
        var secret = req.query.secretKey;

        var id = req.query.id;

        (async () => {
            let exchange = new ccxt[ex] ({
                apiKey: api,
                secret: secret,
                'enableRateLimit': true
            });

            await exchange.cancelOrder(id)
            .then(function(result){
                res.send(result);
            })
            .catch(function(error) {
                res.send(sendError(error));
            });
        }) ()
    }

}

exports.deposit = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var api = req.query.api;
        var secret = req.query.secret;

        var sym = req.query.sym;

        (async () => {
            let exchange = new ccxt[ex] ({
                apiKey: api,
                secret: secret,
                'enableRateLimit': true
            });
            await exchange.fetchDepositAddress (sym, {})
            .then(function(result){
                res.send(result);
            })
            .catch(function(error) {
                res.send(sendError(error));
            });
        }) ()
    }

}

exports.withdraw = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var api = req.query.api;
        var secret = req.query.secret;

        var sym = req.query.sym;
        var ex = req.query.ex;
        var amount = req.query.amount;
        var address = req.query.address;
        var tag = req.query.tag;

        (async () => {
            let exchange = new ccxt[ex] ({
                apiKey: api,
                secret: secret,
                'enableRateLimit': true
            });
            await exchange.withdraw(sym, amount, address, tag, {})
            .then(function(result){
                res.send(result);
            })
            .catch(function(error) {
                res.send(sendError(error));
            });

        }) ()
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

exports.tradingview = (req, res) => {
    var sym = req.query.sym;
    res.render('tv',{id:sym});
}

function sendError(e){
    return {'name': e.constructor.name, "msg":e.toString()}
}