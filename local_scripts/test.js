const ccxws = require("ccxws");
const binance = new ccxws['binance']();

// market could be from CCXT or genearted by the user
const market = {
  id: "ETHBTC", // remote_id used by the exchange
  base: "ETH", // standardized base symbol for Cardano
  quote: "BTC", // standardized quote symbol for Bitcoin
};
//
// handle trade events
binance.on("ticker", trade => console.log(trade));

// subscribe to trades
binance.subscribeTicker(market);

