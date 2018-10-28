
const axios = require('axios');

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

        var url = "https://insight.bitpay.com/api"
        if (coin == "btc"){
            if (chain =="test"){
                url = "https://test-insight.bitpay.com/api"
            } else {
                url = "https://insight.bitpay.com/api"
            }
        } else if (coin == "bch"){
            if (chain == "test"){
                url = "https://test-bch-insight.bitpay.com/api"
            } else {
                url = "https://bch-insight.bitpay.com/api"   
            }
        }
        
        axios.get(url+'/tx/send/'+tx_hex)
        .then(function (response) {
            res.status(200).json(response.data)
        })
        .catch(function (error) {
            res.status(500).json(error.data)
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

        var url = "https://insight.bitpay.com/api"
        if (coin == "btc"){
            if (chain =="test"){
                url = "https://test-insight.bitpay.com/api"
            } else {
                url = "https://insight.bitpay.com/api"
            }
        } else if (coin == "bch"){
            if (chain == "test"){
                url = "https://test-bch-insight.bitpay.com/api"
            } else {
                url = "https://bch-insight.bitpay.com/api"   
            }
        }
        axios.get(url+'/txs/?address='+add)
        .then(function (response) {
          var txs = response.data
          
          axios.get(url+'/addr/'+add+'?noTxList=1')
          .then(function (response) {
            var balance = response.data   
            res.status(200).json({balance:balance, txs:txs})
          })
          .catch(function (error) {
            res.status(500).json(error.data)
          }); 

        })
        .catch(function (error) {
          res.status(500).json(error.data)
        }); 
    }
};

