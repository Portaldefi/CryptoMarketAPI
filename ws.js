module.exports = function(io){
    const ccxws = require("ccxws");

    io.on("connection", (client)=>{
        console.log("Connection from client: " + client.handshake.address);

        var exchange = client.handshake.query.ex;
        var type = client.handshake.query.type;
        var symbol = client.handshake.query.symbol;

        const exchng = new ccxws.Binance();

        if (exchange=="binance"){
            exchng = new ccxws.Binance();
        } else if (type=="gdax"){
            exchng = new ccxws.GDAX();
        } else if (type=="bittrex"){
            exchng = new ccxws.Bittrex();
        } else if (type=="huobi"){
            exchng = new ccxws.Huobi();
        }

        if (type=="depth"){
            exchng.on("ticker", trade => function (){
                if (trade.fullId == symbol){
                    client.emit(trade);
                }
            });
        } else if (type=="ticker"){
            exchng.on("l2snapshot", trade => function (){
                if (trade.fullId == symbol){
                    client.emit(trade);
                }
            });
            exchng.on("l2update", trade => function (){
                if (trade.fullId == symbol){
                    client.emit(trade);
                }
            });
            exchng.on("l3snapshot", trade => function (){
                if (trade.fullId == symbol){
                    client.emit(trade);
                }
            });
            exchng.on("l3update", trade => function (){
                if (trade.fullId == symbol){
                    client.emit(trade);
                }
            });
        } else {
            return
        }

        client.on('disconnect', () => console.log('Client disconnected ' + client.handshake.address));

    });
}
