FORMAT: 1A
HOST: http://polls.apiblueprint.org/

# Portal Web Services

Portal web services provide several APIs for registering devices, setting alerts, getting market prices

## BASE URL
### REST API 
https://cryptomarket-api.herokuapp.com

### Websocket API 
https://portalex.herokuapp.com

We use socket.io library for socket connections. It has several client libraries available and provides an easy integration.
- Websocket URI : https://portalex.herokuapp.com

- Parameters: 
exchange, symbol, base, quote, id

- Once, connected via socket, you can listen on 2 messages, ticker and orderbook
ex:
        
socket.on("connect") { 
            
    socket.on("ticker") { response }

    socket.on("orderbook") { response }
}

        
### Ticker response object:
+ fullId: string - the normalized market id prefixed with the exchange, ie: Binance:LTC/BTC
+ exchange: string - the name of the exchange
+ base: string - the normalized base symbol for the market
+ quote: string - the normalized quote symbol for the market
+ timestamp: int - the unix timestamp in milliseconds
+ last: string - the last price of a match that caused a tick
+ open: string - the price 24 hours ago
+ low: string - the highest price in the last 24 hours
+ high: string - the lowest price in the last 24 hours
+ volume: string - the base volume traded in the last 24 hours
+ quoteVolume: string - the quote volume traded in the last 24 hours
+ change: string - the price change (last - open)
+ changePercent: string - the price change in percent (last - open) / open * 100
+ bid: string - the best bid price
+ bidVolume: string - the volume at the best bid price
+ ask: string - the best ask price
+ askVolume: string - the volume at the best ask price


### Orderbook response object:
+ fullId: string - the normalized market id prefixed with the exchange, ie: Binance:LTC/BTC
+ exchange: string - the name of the exchange
+ base: string - the normalized base symbol for the market
+ quote: string - the normalized quote symbol for the market
+ timestampMs: int - optional timestamp in milliseconds for the snapshot
+ sequenceId: int - optional sequence identifier for the snapshot
+ asks: [Level2Point] - the ask (seller side) price points
+ bids: [Level2Point] - the bid (buyer side) price points

### Level2Point object:
+ price: string - price
+ size: string - aggregated volume for all orders at this price point
+ count: int - optional number of orders aggregated into the price point

# API Collection
Below are a list of APIs leverage in portal desktop app at various interfaces.

## Get all ERC20 tokens [/erc20_token_list]
### Get a list of all popular ERC20 tokens (will be deprecated once tokenlist is enabled) [GET]

## Top Coin [/exchange/top_coin]
### Get top coin by 24hr % change [GET]
+ Response 200 (application/json)

        [  
           {  
              "change":13.552,
              "icon":"https://www.cryptocompare.com/media/35650476/matic.png",
              "last":0.01969,
              "name":"Matic Network"
           }
        ]

## Supported exchanges  [/exchange/list]
### Get list of supported exchanges [GET]
+ Response 200 (application/json)

        [  
           {  
              "exchange":"Binance",
              "id":"binance",
              "icon":"https://cryptomarket-api.herokuapp.com/images/binance.png"
           },
           {  
              "exchange":"Bittrex",
              "id":"bittrex",
              "icon":"https://cryptomarket-api.herokuapp.com/images/bittrex.png"
           },
           {  
              "exchange":"Coinbase Pro",
              "id":"coinbasepro",
              "icon":"https://cryptomarket-api.herokuapp.com/images/gdax.png"
           },
           {  
              "exchange":"Kraken",
              "id":"kraken",
              "icon":"https://cryptomarket-api.herokuapp.com/images/Kraken.png"
           }
        ]

## Exchange Trading Pairs [/exchange/pairs{?ex}]
### Get list of all trading pairs in exchanges [GET]
+ Parameters
    + ex (string) - exchange id 
    
+ Response 200 (application/json)

        [  
           {  
              "exchange":[  
                 {  
                    "id":"kraken",
                    "sym":"XETHZGBP.d",
                    "bVol":0,
                    "qVol":0,
                    "price":0,
                    "active":true
                 }
              ],
              "icon":"https://www.cryptocompare.com/media/20646/eth_logo.png",
              "name":"Ethereum",
              "base":"ETH",
              "quote":"GBP",
              "quote_icon":"https://cryptomarket-api.herokuapp.com/images/coins/GBP.png",
              "quote_name":"British Pound",
              "symbol":"ETHGBP.d",
              "change":0,
              "last":0,
              "id":"ETHGBP.d"
           }
        ]

## Coin list [/exchange/asset_list]
### Get all coin assets [GET]
+ Response 200 (application/json)

            [  
               {  
                  "_id":"5ce35d190088a11ec3099c63",
                  "symbol":"GNT",
                  "exchange":[  
                     {  
                        "id":"coinbasepro",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"huobipro",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"bittrex",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"binance",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"upbit",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"zb",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"bitfinex",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     }
                  ],
                  "icon":"https://www.cryptocompare.com/media/351995/golem_logo.png",
                  "id":33022,
                  "name":"Golem Network Token",
                  "platform":{  
                     "id":1027,
                     "name":"Ethereum",
                     "symbol":"ETH",
                     "slug":"ethereum",
                     "token_address":"0xa74476443119A942dE498590Fe1f2454d7D4aC0d"
                  }
               },
               {  
                  "_id":"5ce35d190088a11ec3099c69",
                  "symbol":"XLM",
                  "exchange":[  
                     {  
                        "id":"coinbasepro",
                        "active":false,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"huobipro",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"bittrex",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"binance",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"upbit",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"kraken",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"zb",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     },
                     {  
                        "id":"bitfinex",
                        "active":true,
                        "deposit":true,
                        "withdraw":true
                     }
                  ],
                  "icon":"https://www.cryptocompare.com/media/20696/str.png",
                  "id":4614,
                  "name":"Stellar",
                  "platform":null
               }
            ]

## Exchange error codes [/exchange/error_codes]
### Get list of exchange error codes [GET]
+ Response 200 (application/json)

        {  
           "binance":[  
              {  
                 "code":"-1000",
                 "msg":"An unknown error occured while processing the request."
              },
              {  
                 "code":"-1001",
                 "msg":"Internal error; unable to process your request. Please try again."
              },
              {  
                 "code":"-1002",
                 "msg":"You are not authorized to execute this request."
              },
              {  
                 "code":"-1003",
                 "msg":"Too many requests queued."
              },
              {  
                 "code":"-1006",
                 "msg":"An unexpected response was received from the message bus. Execution status unknown."
              },
              {  
                 "code":"-1007",
                 "msg":"Timeout waiting for response from backend server. Send status unknown; execution status unknown."
              },
              {  
                 "code":"MAX_ALGO_ORDERS",
                 "msg":"Account has too many open stop loss and/or take profit orders on the symbol."
              },
              {  
                 "code":"EXCHANGE_MAX_NUM_ORDERS",
                 "msg":"Account has too many open orders on the exchange."
              },
              {  
                 "code":"EXCHANGE_MAX_ALGO_ORDERS",
                 "msg":"Account has too many open stop loss and/or take profit orders on the exchange."
              }
           ],
           "bittrex":[  
              {  
                 "code":"two_factor_required",
                 "msg":"When sending money over 2fa limit"
              },
              {  
                 "code":"EXCHANGE_MAX_NUM_ORDERS",
                 "msg":"Account has too many open orders on the exchange."
              }
           ],
           "coinbasepro":[  
              {  
                 "code":"two_factor_required",
                 "msg":"When sending money over 2fa limit"
              },
              {  
                 "code":"EXCHANGE_MAX_NUM_ORDERS",
                 "msg":"Account has too many open orders on the exchange."
              }
           ],
           "kraken":[  
              {  
                 "code":"two_factor_required",
                 "msg":"When sending money over 2fa limit"
              },
              {  
                 "code":"EXCHANGE_MAX_NUM_ORDERS",
                 "msg":"Account has too many open orders on the exchange."
              }
           ]
        }

## Create a price alerts API [/create_alert{?id,dev_id,,coin,price}]
### Create alert [GET]
+ Parameters
    + dev_id - device id of the user (a unique id)
    + id - alert id (a unique id)
    + coin - coin on which alert is set
    + price (number) - alert price
+ Response 200 (application/json)

           {  
              "message":"Successfully created",
           }


## Delete a price alerts API [/delete_alert{?id}]
### Delete alert [GET]
+ Parameters
    + id - alert id
+ Response 200 (application/json)

           {  
              "message":"Successfully removed",
           }


## User API [/register_user{?dev_id,token,platform}]
### Register a user [GET]
+ Parameters
    + dev_id - device id of the user (a unique id)
    + token - push token of the device
    + platform - OS platform, ex: "MacOS, windows"
+ Response 200 (application/json)

           {  
              "message":"Successfully created",
           }

