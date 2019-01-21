module.exports = function(io){
    const ccxws = require("ccxws");

    io.on("connection", (client)=>{
        // console.log("Connection from client: " + client.handshake.address);
        // console.log(client.handshake.query);
        var exchange = "";
        var type = "";
        var symbol = "";
        var base = "";
        var quote = "";
        var id = "";

        exchange = client.handshake.query.ex;
        type = client.handshake.query.type;
        symbol = client.handshake.query.symbol;
        base = client.handshake.query.base;
        quote =client.handshake.query.quote;
        id = client.handshake.query.id;

        var exchng = new ccxws.binance();
        (async () => {
            try{

                let symbolId = {
                    id: id, 
                    base: base,
                    quote: quote,
                  };
        
                if (type=="gdax"){
                    exchng = new ccxws.coinbasepro();
                } else {
                    exchng = new ccxws[exchange]();
                }
        
                if (type=="ticker"){
                    exchng.on("ticker", trade => client.emit(trade));
                    exchng.subscribeTicker(symbolId);
                } else if (type=="depth"){
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
            } catch(error){
                console.log(error)
            }
        }) ()
        client.on('disconnect', () => console.log('Client disconnected ' + client.handshake.address));

    });
}
