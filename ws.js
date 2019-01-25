module.exports = function(io){
    const ccxws = require("ccxws");

    io.on("connection", (client)=>{
        // console.log("Connection from client: " + client.handshake.address);
        // console.log(client.handshake.query);
        var exchange = "";
        var base = "";
        var quote = "";
        var id = "";

        exchange = client.handshake.query.ex;
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
        
                if (exchange=="gdax"){
                    exchng = new ccxws.coinbasepro();
                } else {
                    exchng = new ccxws[exchange]();
                }
        
                exchng.on("ticker", trade => client.emit("ticker",trade));
                exchng.subscribeTicker(symbolId);

                exchng.on("trades", trade => console.log("trade", trade));
                exchng.subscribeTrades(symbolId);

                if (exchange=="huobi"|| exchange=="binance"){
                    exchng.on("l2snapshot", trade => client.emit("orderbook", trade));
                    exchng.subscribeLevel2Snapshots(symbolId);
                }

                if (exchange!="huobi"){
                    exchng.on("l2update", trade => client.emit("orderbook", trade));
                    exchng.subscribeLevel2Updates(symbolId);
                }

            } catch(error){
                client.emit(error)
                socket.disconnect()
            }
        }) ()

        client.on('disconnect', () => console.log('Client disconnected ' + client.handshake.address)
            
        );

    });
}
