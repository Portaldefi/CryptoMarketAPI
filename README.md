APIs for Exchange
============================================

Get top coin by 24hr % change
-------------------------------------
url: /exchange/top_coin
type: GET

Get list of supported exchanges
-------------------------------------
url: /exchange/list
type: GET

Get list of all trading pairs in exchanges
------------------------------------------
url: /exchange/pairs?ex=binance,bittrex
type: GET

Get my exchange balances 
--------------------------------
url:/exchange/get_balance?ex=binance&apiKey=Eq9&secretKey=B4mp
type: GET

Get my exchange orders for a trading pair
--------------------------------------------------
url:/exchange/get_orders?ex=binance&sym=‘ETH/BTC’&apiKey=Eq9J&secretKey=B4m
type: GET

Place a buy/sell order on a given exchange
-----------------------------------------------------------------------
url: /exchange/place_order?ex=binance&sym=‘ETH/BTC’&apiKey=“gfgdf”&secretKey=“dsgfd”&type=MarketSell&price=1.01&amount=1.0
type: GET
possible values of type = MarketSell,MarketBuy,LimitSell,LimitBuy

Cancel Order
--------------------------------------
url:/exchange/cancel_order?id=ksdjfdshkfjsd&apiKey=Eq9J&secretKey=B4m&ex=binance
type: GET

Deposit address for exchange API
--------------------------------------
url:/exchange/deposit?ex=binance&sym=‘ETH’&apiKey=Eq9J&secretKey=B4m
type: GET

Withdraw from exchange API
--------------------------------------
url:/exchange/withdraw?ex=binance&sym=‘ETH’&apiKey=Eq9J&secretKey=B4m&amount=10&address=sdfdsf&tag=null
type: GET

Klines
-------------------------------------------------------------------------------
REST API:

URL:/exchange/ohlcv?ex=binance&sym='ETH/BTC'&interval=1m
TYPE: GET
supported intervals = 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M

Orderbook
------------------------------------------------------------------------------
REST API:

URL:/exchange/depth?ex=binance&sym='ETH/BTC'
TYPE: GET

Ticker
------------------------------------------------------------------------------
REST API:

URL:/exchange/ticker?ex=binance&sym='ETH/BTC'
TYPE: GET

Websocket
=====================================================
Websocket, use socket.io Swift library. Send following parameters with connection, 
ex, type {depth,ticker}, symbol


Bitcoin Broadcast Raw Transactions
=====================================================

Address: 
http://cryptomarket-api.herokuapp.com/address?chain=main&coin=btc&address=18cBEMRxXHqzWWCxZNtU91F5sbUNKhL5PX

Push tx: 
http://cryptomarket-api.herokuapp.com/submit_tx?chain=main&coin=btc&tx_hex=fgfgfgfdX

Allowed coins:
btc, bch

Allowed chains:
test, main

Crypto Market API
=====================================================

https://cryptomarket-api.herokuapp.com/histoday?fsyms=BTC,BCH,ETH,ZEC&tsym=USD&limit=10
https://cryptomarket-api.herokuapp.com/histohour?fsyms=BTC,BCH,ETH,ZEC&tsym=USD&limit=10
https://cryptomarket-api.herokuapp.com/histominute?fsyms=BTC,BCH,ETH,ZEC&tsym=USD&limit=10

https://cryptomarket-api.herokuapp.com/price?fsyms=BTC,BCH,ETH,ZEC&tsyms=USD,ETH
https://cryptomarket-api.herokuapp.com/price_full?fsyms=BTC,BCH,ETH,ZEC&tsyms=USD,ETH


Price Alerts API
=====================================================
Create alert api:
url: https://cryptomarket-api.herokuapp.com/create_alert
parameters:
{
	"id": "sd4321dfsgfdg", // unique identifier for each alert
	"device_id": "gsfdsgfdgSFD", //device id
	"push_token": "dfgsdfgfs", //apple push token
	"coin": "BTC",
	"current_price": 6100,
}

Delete alert api:
url: https://cryptomarket-api.herokuapp.com/delete_alert
parameters:
{
	"id": "sd4321dfsgfdg", // unique identifier for each alert
}


ERC20 tokens API
=====================================================

Get ERC20 Tokens
url:/get_tokens?address=0xdfgfgddhgh546546hgdd
