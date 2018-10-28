
var ACCESS_TOKEN = "ce49c75072484649bbd27d94a7c9d4a3";

exports.submit_tx = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var chain = req.query.chain;
        var coin = req.query.coin; 
        var tx_hex = req.query.tx_hex; 

        bcypher = require('blockcypher');
        var bcapi = new bcypher(coin,chain,ACCESS_TOKEN);
        bcapi.pushTX(tx_hex, {}, function(err, data) {
            if (err !== null) {
              res.status(500).json(err)
            } else {
              res.status(200).json(data)
            }
        }); 
    }
};

exports.address = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var chain = req.query.chain;
        var coin = req.query.coin; 
        var add = req.query.address; 

        bcypher = require('blockcypher');
        var bcapi = new bcypher(coin,chain,ACCESS_TOKEN);
        bcapi.getAddr(add,{}, function(err, data) {
            if (err !== null) {
              res.status(500).json(err)
            } else {
              res.status(200).json(data)
            }
        }); 
    }
};

