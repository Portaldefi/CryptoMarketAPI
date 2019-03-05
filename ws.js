module.exports = function(io){
    const ccxws = require("ccxws");
    const ccxt = require ('ccxt');

    io.on("connection", (client)=>{
        // console.log("Connection from client: " + client.handshake.address);
        // console.log(client.handshake.query);
        var exchange = "";
        var base = "";
        var quote = "";
        var id = "";
        var symbol = "";

        exchange = client.handshake.query.ex;
        base = client.handshake.query.base;
        quote =client.handshake.query.quote;
        id = client.handshake.query.id;
        symbol = client.handshake.query.symbol;

        var exchng = new ccxws.binance();
        (async () => {
            try{

                let symbolId = {
                    id: id, 
                    base: base,
                    quote: quote,
                };
        
                if (exchange=="gdax"){
                    exchng = new ccxws.coinbasepro();
                } else if(exchange=="huobipro") {
                    exchng = new ccxws.huobi();
                } else {
                    exchng = new ccxws[exchange]();
                }
        
                exchng.on("ticker", trade => client.emit("ticker",trade));
                exchng.subscribeTicker(symbolId);

                exchng.on("trades", trade => client.emit("trade", trade));
                exchng.subscribeTrades(symbolId);
                
                if (exchange=="huobipro"|| exchange=="binance"||exchange=="upbit"||exchange=="zb"){
                    exchng.on("l2snapshot", trade => client.emit("orderbook", sanitizeOrderbook(trade)));
                    exchng.subscribeLevel2Snapshots(symbolId);
                }

                if (exchange=="bittrex"||exchange=="coinbasepro"){
                    // updates
                    exchng.on("l2update", trade => client.emit("orderbook", sanitizeOrderbook(trade)));
                    exchng.subscribeLevel2Updates(symbolId);

                    // snapshot
                    let ccxt_ex = new ccxt[exchange] ();
                    (async () => {
                        await ccxt_ex.fetchTicker(symbol)
                        .then(function(result){
                            let snp = tickerSnapshot(result,base,quote);
                            client.emit("ticker", snp);
                        })
                        .catch(function(error) {
                            console.log(error);
                        });

                        await ccxt_ex.fetchOrderBook(symbol)
                        .then(function(result){
                            let snp = orderSnapshot(result);
                            client.emit("orderbook", snp);
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                    })()

                }

            } catch(error){
                client.emit(error)
                client.disconnect()
            }
        }) ()

        client.on('disconnect', () => console.log('Client disconnected ' + client.handshake.address)
        );

        client.on('end', function() {
            console.log('stream end emitted')
            console.log(io.engine.clientsCount)
            var exchange = "";
            var base = "";
            var quote = "";
            var id = "";
    
            exchange = client.handshake.query.ex;
            base = client.handshake.query.base;
            quote =client.handshake.query.quote;
            id = client.handshake.query.id;

            let symbolId = {
                id: id, 
                base: base,
                quote: quote,
            };

            if (exchange=="gdax"){
                exchng = new ccxws.coinbasepro();
            } else {
                exchng = new ccxws[exchange]();
            }
            (async () => {
                exchng.unsubscribeTicker(symbolId);
                exchng.unsubscribeTrades(symbolId);

                if (exchange=="huobipro"|| exchange=="binance"||exchange=="upbit"||exchange=="zb"){
                    exchng.unsubscribeLevel2Snapshots(symbolId);
                }

                if (exchange=="bittrex"||exchange=="coinbasepro"){
                    exchng.unsubscribeLevel2Updates(symbolId);
                }
            }) ()
            client.disconnect(true);

        });

    });
}


function tickerSnapshot(obj,base,quote){
   return {ask: String(obj.ask),
            base: base,
            bid: String(obj.bid),
            change: String(obj.change),
            high: String(obj.high),
            last: String(obj.last),
            low: String(obj.low),
            open: String(obj.info.PrevDay),
            quote: quote,
            quoteVolume: String(obj.quoteVolume),
            timestamp: obj.timestamp,
            volume: String(obj.baseVolume)}; 
}

function orderSnapshot(obj){
    var asks = obj.asks;
    var bids = obj.bids;
    var askArr = [];
    var bidArr = [];

    for(var i=0;i<asks.length;i++){
        askArr.push({price:String(asks[i][0]),size:String(asks[i][1])});
    }

    for(var i=0;i<bids.length;i++){
        bidArr.push({price:String(bids[i][0]),size:String(bids[i][1])});
    }
    return {asks:askArr,bids:bidArr}

}

function sanitizeOrderbook(obj){
    var asks = obj.asks;
    var bids = obj.bids;
    var askArr = [];
    var bidArr = [];
    
    for(var i=0;i<asks.length;i++){
        askArr.push({price:String(asks[i].price),size:String(asks[i].size)});
    }

    for(var i=0;i<bids.length;i++){
        bidArr.push({price:String(bids[i].price),size:String(bids[i].size)});
    }
    return {asks:askArr,bids:bidArr}
}