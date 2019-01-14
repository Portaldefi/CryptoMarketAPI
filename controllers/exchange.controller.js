var ccxt = require ('ccxt');
var TradeCoin = require('../models/TradeCoin');

exports.list = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var list = [{exchange:"Binance", id:"binance", icon:"https://cryptomarket-api.herokuapp.com/images/binance.png"},
                // {exchange:"Kraken", id:"kraken", icon:"https://cryptomarket-api.herokuapp.com/images/Kraken.png"},
                {exchange:"Bittrex", id:"bittrex", icon:"https://cryptomarket-api.herokuapp.com/images/bittrex.png"},
                {exchange:"Huobi", id:"huobi", icon:"https://cryptomarket-api.herokuapp.com/images/huobi.png"},
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
            {$match:{exchange_id:{$in:ex}}},
            {$unwind: "$exchange_id" },
            {$match: { "exchange_id": { "$in": ex} },},
            {  
                $group: {
                    _id: '$id',
                    exchange_id: { $push: "$exchange_id" },
                    data : {"$first" : "$$ROOT"}
                },
            },
            {$project : {
                icon : "$data.icon",
                name : "$data.name",
                base : "$data.base",
                quote : "$data.quote",
                symbol : "$data.symbol",
                change : "$data.change",
                last : "$data.last",
                exchange_id : 1,
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
            });
            let markets = await exchange.fetchBalance();

            res.status(200).json(markets);
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
            });
            let markets = await exchange.fetchOrders(ticker);

            res.status(200).json(markets);
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
        var api = req.query.api;
        var secret = req.query.secret;

        var type = req.query.type;
        var sym = req.query.sym;
        var ex = req.query.ex;
        var price = req.query.price;
        var amount = req.query.amount;

        (async () => {
            let exchange = new ccxt[ex] ({
                apiKey: api,
                secret: secret,
            });
            if (type=="MarketSell"){
                await exchange.createMarketSellOrder (sym, amount);
            } else if (type=="MarketBuy") {
                await exchange.createMarketBuyOrder (sym, amount);
            } else if (type=="LimitSell") {
                await exchange.createLimitBuyOrder (sym, amount, price)
            } else if (type=="LimitBuy") {
                await exchange.createLimitBuyOrder (sym, amount, price)
            }
            
            res.status(200).json("Successfully placed!");
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
        var api = req.query.api;
        var secret = req.query.secret;

        var id = req.query.id;

        (async () => {
            let exchange = new ccxt[ex] ({
                apiKey: api,
                secret: secret,
            });

            exchange.cancelOrder(id);
            res.status(200).json("Successfully canceled!");
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
            });
            let deposit = exchange.fetchDepositAddress (sym, {})
            res.status(200).json(deposit);

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
            });
            let withdraw = exchange.withdraw(sym, amount, address, tag, {});
            res.status(200).json(withdraw);

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

        var sym = req.query.sym;
        var ex = req.query.ex;
        var interval = req.query.interval;

        (async () => {
            let exchange = new ccxt[ex] ();
            let ohlcv = await exchange.fetchOHLCV (sym, interval)
            res.status(200).json(ohlcv);
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
        var sym = req.query.sym;
        var ex = req.query.ex;

        (async () => {
            let exchange = new ccxt[ex] ();
            let depth = exchange.fetchOrderBook (sym);
            res.status(200).json(depth);

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
        var sym = req.query.sym;
        var ex = req.query.ex;

        (async () => {
            let exchange = new ccxt[ex] ();
            let depth = exchange.fetchTicker (sym);
            res.status(200).json(depth);

        }) ()
    }
}

exports.top_coin = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    TradeCoin.find({}).sort({"change": -1}).limit(1).exec( function(err, doc) {
        res.status(200).json(doc);
   });
}