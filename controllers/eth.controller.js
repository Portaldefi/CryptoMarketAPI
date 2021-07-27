const async = require('async')
var asyncLoop = require('node-async-loop');

let Ethplorer = require('ethplorer-js').Ethplorer;
let api = new Ethplorer();

var etherscan = require('etherscan-api').init('8ITET8HKKRCJVWVA1HJ3FQGSVB1GE1IW5R');
var Coin = require('../models/Coin');

exports.get_tokens = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var address = req.query.address;
        var info = [];
        api.getAddressInfo(address)
        .then(data => {
            if("error" in data){
                res.status(500).json(data) 
            } else {
                if (!data.hasOwnProperty('tokens')){
                    res.status(200).json([]);
                    return 
                }
                var tokens = data.tokens;
                var tx = etherscan.account.tokentx(address);
                tx.then(function(result){
                    var tokentxs = result.result;
                    var fsyms = [];
                    for (var j=0;j<tokens.length;j++){
                        fsyms.push(tokens[j].tokenInfo.symbol)
                    }
                    Coin.find({symbol:{$in:fsyms}}, function(err, coins){
                        if (err){
                            res.status(500).json(err)
                        } else {
                            asyncLoop(coins, function (coin, next)
                            {
                                var token = tokens.find(item => item.tokenInfo.symbol === coin.symbol);
                                var tokeninfo = token.tokenInfo;
                                var price = tokeninfo.price;
                                var balance = token.balance;
    
                                if (balance>0 && price){
                                    var symbol = tokeninfo.symbol;
                                    var decimals = tokeninfo.decimals;
                                    var name = tokeninfo.name;
                                    var contract = tokeninfo.address;
                                    var accnt = balance/Math.pow(10, parseFloat(decimals));    
                                    var tx = findTx(tokentxs, contract, Math.pow(10, parseFloat(decimals)));
                                    var icon = coin.icon;
                                    var obj = {symbol:symbol, name:name, address:contract, icon:icon, balance:accnt, decimals:decimals, transactions:tx}
                                    info.push(obj);
                                }
                                next();
                            }, function (err)
                            {
                                if (err)
                                {
                                    res.status(500).json(err);
                                    return;
                                }
                                res.status(200).json(info); 
                            });
                        }
                    });
                });
            }
        })
        .catch(err => {
            res.status(500).json(err) 
        })
    }
};

function findTx(list, address, decimals){
    var txs =[];
    for (var l=0;l<list.length;l++){
        var cont = list[l].contractAddress
        if (cont == address){
            var tx = list[l];
            var accnt = parseFloat(tx.value)/decimals;
            var obj = {hash:tx.hash, from:tx.from, to:tx.to, contract:tx.contractAddress, timestamp:tx.timeStamp, 
            value:accnt, confirmations:tx.confirmations};
            txs.push(obj);
        }
    }
    return txs
}

exports.erc20_list = (req, res) => {
   res.setHeader('Content-Type', 'application/json');

   var path = require('path');
   var tokens = path.resolve('./public/tokens.json');

   const fs = require('fs')

    fs.readFile(tokens, 'utf8' , (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        res.status(200).send(data);
    });

}