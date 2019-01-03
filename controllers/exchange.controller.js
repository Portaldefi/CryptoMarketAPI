var ccxt = require ('ccxt');

exports.list = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var list = [{exchange:"Binance", id:"binance", icon:"https://cryptomarket-api.herokuapp.com/images/binance.png"},
                 {exchange:"Kraken", id:"kraken", icon:"https://cryptomarket-api.herokuapp.com/images/Kraken.png"},
                {exchange:"Bittrex", id:"bittrex", icon:"https://cryptomarket-api.herokuapp.com/images/bittrex.png"}];
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
        var list = [];
        (async () => {
            for(var i=0;i<ex.length;i++){
                var ex_id = ex[i];
                let exchange = new ccxt[ex_id] ();
                let markets = await exchange.loadMarkets();
                for(var symb in markets){
                    var pair = markets[symb];
                    var id = pair.id;
                    var symbol = pair.symbol;
                    var base = pair.base;
                    var quote = pair.quote;
                    let index = list.findIndex(o => o.symbol === symbol);
                    if (index==-1){
                        list.push({id:id, symbol:symbol, base:base, quote:quote, exchange_id:[ex_id]});
                    } else {
                        list[index].exchange_id.push(ex_id);
                    }
                }
            }
            res.status(200).json(list);
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