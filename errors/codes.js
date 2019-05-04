
var binance = [{"code":"-1000","msg":"An unknown error occured while processing the request."},
    {"code":"-1001","msg":"Internal error; unable to process your request. Please try again."},
    {"code":"-1002","msg":"You are not authorized to execute this request."},
    {"code":"-1003","msg":"Too many requests queued."},
    {"code":"-1006","msg":"An unexpected response was received from the message bus. Execution status unknown."},
    {"code":"-1007","msg":"Timeout waiting for response from backend server. Send status unknown; execution status unknown."},
    {"code":"-1014","msg":"Unsupported order combination."},
    {"code":"-1015","msg":"Too many new orders."},
    {"code":"-1016","msg":"This service is no longer available."},
    {"code":"-1020","msg":"This operation is not supported."},
    {"code":"-1021","msg":"Timestamp for this request is outside of the recvWindow."},
    {"code":"-1022","msg":"Signature for this request is not valid."},
    {"code":"-1100","msg":"Illegal characters found in a parameter."},
    {"code":"-1101","msg":"Too many parameters sent for this endpoint."},
    {"code":"-1102","msg":"A mandatory parameter was not sent, was empty/null, or malformed."},
    {"code":"-1103","msg":"An unknown parameter was sent."},
    {"code":"-1104","msg":"Not all sent parameters were read."},
    {"code":"-1105","msg":"A parameter was empty."},
    {"code":"-1106","msg":"A parameter was sent when not required."},
    {"code":"-1111","msg":"Precision is over the maximum defined for this asset."},
    {"code":"-1112","msg":"No orders on book for symbol."},
    {"code":"-1114","msg":"TimeInForce parameter sent when not required."},
    {"code":"-1115","msg":"Invalid timeInForce."},
    {"code":"-1116","msg":"Invalid orderType."},
    {"code":"-1117","msg":"Invalid side."},
    {"code":"-1118","msg":"New client order ID was empty."},
    {"code":"-1119","msg":"Original client order ID was empty."},
    {"code":"-1120","msg":"Invalid interval."},
    {"code":"-1121","msg":"Invalid symbol."},
    {"code":"-1125","msg":"This listenKey does not exist."},
    {"code":"-1127","msg":"Lookup interval is too big."},
    {"code":"-1128","msg":"Combination of optional parameters invalid."},
    {"code":"-1130","msg":"Invalid data sent for a parameter."},
    {"code":"-2010","msg":"New order rejected."},
    {"code":"-2011","msg":"CANCEL_REJECTED"},
    {"code":"-2013","msg":"Order does not exist."},
    {"code":"-2014","msg":"API-key format invalid."},
    {"code":"-2015","msg":"Invalid API-key, IP, or permissions for action."},
    {"code":"-2016","msg":"No trading window could be found for the symbol. Try ticker/24hrs instead."},
    {"code":"PRICE_FILTER","msg":"price is too high, too low, and/or not following the tick size rule for the symbol."},
    {"code":"LOT_SIZE","msg":"quantity is too high, too low, and/or not following the step size rule for the symbol."},
    {"code":"MIN_NOTIONAL","msg":"price * quantity is too low to be a valid order for the symbol."},
    {"code":"MARKET_LOT_SIZE","msg":"MARKET order's quantity is too high, too low, and/or not following the step size rule for the symbol."},
    {"code":"MAX_NUM_ORDERS","msg":"Account has too many open orders on the symbol."},
    {"code":"MAX_NUM_ICEBERG_ORDERS","msg":"Account has too many open iceberg orders on the symbol."},
    {"code":"MAX_ALGO_ORDERS","msg":"Account has too many open stop loss and/or take profit orders on the symbol."},
    {"code":"EXCHANGE_MAX_NUM_ORDERS","msg":"Account has too many open orders on the exchange."},
    {"code":"EXCHANGE_MAX_ALGO_ORDERS","msg":"Account has too many open stop loss and/or take profit orders on the exchange."}
];

var coinbasepro =[    
    {"code":"two_factor_required","msg":"When sending money over 2fa limit"},
    {"code":"EXCHANGE_MAX_NUM_ORDERS","msg":"Account has too many open orders on the exchange."},
];

var bittrex =[    
    {"code":"two_factor_required","msg":"When sending money over 2fa limit"},
    {"code":"EXCHANGE_MAX_NUM_ORDERS","msg":"Account has too many open orders on the exchange."},
];

var kraken =[    
    {"code":"two_factor_required","msg":"When sending money over 2fa limit"},
    {"code":"EXCHANGE_MAX_NUM_ORDERS","msg":"Account has too many open orders on the exchange."},
];

const codes  = {
    "binance":binance, 
    "bittrex":bittrex, 
    "coinbasepro":coinbasepro, 
    "kraken":kraken
};

exports.error_codes = codes;
