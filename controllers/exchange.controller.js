var ccxt = require ('ccxt');

exports.list = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var list = [{exchange:"Binance", id:"binance", icon:"https://cryptomarket-api.herokuapp.com/images/binance.png"},
                {exchange:"Kraken", id:"kraken", icon:"https://cryptomarket-api.herokuapp.com/images/Kraken.png"},
                {exchange:"Bittrex", id:"bittrex", icon:"https://cryptomarket-api.herokuapp.com/images/bittrex.png"}];
    res.status(200).json(list);
}

exports.load_markets = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var ex = req.query.ex.split(',');
        (async () => {
            let binance = new ccxt.binance ();
            let markets = await binance.fetchMarkets();

            res.status(200).json(markets);
        }) ()
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
            let binance = new ccxt.binance ({
                'apiKey': api,
                'secret': secret,
            });
            let markets = await binance.fetchBalance();

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
            let binance = new ccxt.binance ({
                'apiKey': api,
                'secret': secret,
            });
            let markets = await binance.fetchOrders(ticker);

            res.status(200).json(markets);
        }) ()
    }
}

exports.load_pair = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {

        (async () => {
            let binance = new ccxt.binance ();
            var ticker = req.query.sym;

            res.status(200).json(await binance.fetchOrderBook (ticker));
        }) ()
    }
}

exports.order = (req, res) => {
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
            let binance = new ccxt.biance ({
                apiKey: api,
                secret: secret,
            });
            if (type="MarketSell"){
                await binance.createMarketSellOrder (sym, amount);
            } else if (type="MarketBuy") {
                await binance.createMarketBuyOrder (sym, amount);
            } else if (type="LimitSell") {
                await binance.createLimitBuyOrder (sym, amount, price)
            } else if (type="LimitBuy") {
                await binance.createLimitBuyOrder (sym, amount, price)
            }
            
            res.status(200).json("Successfully placed!");
        }) ()
    }
}