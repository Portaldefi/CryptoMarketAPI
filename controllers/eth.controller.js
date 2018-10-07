const async = require('async')

let Ethplorer = require('ethplorer-js').Ethplorer;
let api = new Ethplorer();

var etherscan = require('etherscan-api').init('8ITET8HKKRCJVWVA1HJ3FQGSVB1GE1IW5R');


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
                var tokens = data.tokens;
                var tx = etherscan.account.tokentx(address);
                tx.then(function(result){
                    var tokentxs = result.result;
                    var counter = 0;
                    async.each(tokens, function(token, callback) {
                        counter++;
                        var tokeninfo = token.tokenInfo;
                        var symbol = tokeninfo.symbol;
                        var contract = tokeninfo.address;
                        var price = tokeninfo.price;
                    
                        if (price){
                            var tx = findTx(tokentxs, contract)
                            var icon = "https://chasing-coins.com/api/v1/std/logo/"+symbol;
                            var obj = {info:tokeninfo, transactions:tx, icon:icon}
                            info.push(obj);
                        }
                        if (counter==tokens.length){
                            callback(null)
                            res.status(200).json(info) 
                        } 
                      }, function(err) {
                        if(err) {
                          res.status(500).json(err)
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

function findTx(list, address){
    var txs =[];
    for (var l=0;l<list.length;l++){
        var cont = list[l].contractAddress
        if (cont == address){
            txs.push(list[l]);
        }
    }
    return txs
}