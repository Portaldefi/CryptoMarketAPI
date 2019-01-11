module.exports = function(io){
    const ccxws = require("ccxws");
    const ccxt = require("ccxt");

    io.on("connection", (client)=>{
        console.log("Connection from client: " + client.handshake.address);

        var exchange = client.handshake.query.ex;
        var type = client.handshake.query.type;
        var symbol = client.handshake.query.symbol;

        const exchng = new ccxws.binance();

        const exchange_ccxt = new ccxt[type] ();
        let symbolId = exchange_ccxt.market(symbol); 

        if (type=="gdax"){
            exchng = new ccxws.coinbasepro();
        } else {
            exchng = new ccxws[exchange]();
        }

        if (type=="depth"){
            exchng.on("ticker", trade => client.emit(trade));
            exchng.subscribeTicker(symbolId);
        } else if (type=="ticker"){
            exchng.on("l2snapshot", trade => client.emit(trade));
            exchng.on("l2update", trade => client.emit(trade));
            exchng.on("l3snapshot", trade => client.emit(trade));
            exchng.on("l3update", trade => client.emit(trade));
            exchng.subscribeLevel2Snapshots(symbolId);
            exchng.subscribeLevel2Updates(symbolId);
            exchng.subscribeLevel3Snapshots(symbolId);
            exchng.subscribeLevel3Updates(symbolId);
        } else {
            return
        }

        client.on('disconnect', () => console.log('Client disconnected ' + client.handshake.address));

    });
}
