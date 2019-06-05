
const axios = require('axios');
const validate_address = require('cryptocurrency-address-validator');

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
                url = "https://api.blockchair.com/bitcoin/push/transaction"
            }
        } else if (coin == "bch"){
            if (chain == "test"){
                url = "https://test-bch-insight.bitpay.com/api"
            } else {
                url = "https://api.blockchair.com/bitcoin-cash/push/transaction"   
            }
        }
        axios.post(url, {
            data: tx_hex
        })
        .then(function (result) {
            return res.status(200).send({
                txid: result.data.data.transaction_hash
            });
        })
        .catch(function (error) {
            if (error.response!=undefined){
                var status = error.response.data.context.code;
                if (status==400){
                    return res.status(status).send({
                        message: error.response.data.context.error
                    });
                } else if (status==500){
                    return res.status(status).send({
                        message: "Server issues"
                    });
                }
            }
        });
 
    }
};

// exports.address = (req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//     if(!req.query) {
//         return res.status(400).send({
//             message: "Parameters can not be empty"
//         });
//     } else {
//         var chain = req.query.chain;
//         var coin = req.query.coin; 
//         var add = req.query.address; 

//         var url = "https://insight.bitpay.com/api"
//         if (coin == "btc"){
//             if (chain =="test"){
//                 url = "https://test-insight.bitpay.com/api"
//             } else {
//                 url = "https://insight.bitpay.com/api"
//             }
//         } else if (coin == "bch"){
//             if (chain == "test"){
//                 url = "https://test-bch-insight.bitpay.com/api"
//             } else {
//                 url = "https://bch-insight.bitpay.com/api"   
//             }
//         }
//         axios.get(url+'/txs/?address='+add)
//         .then(function (response) {
//           var txs = response.data
//           axios.get(url+'/addr/'+add+'?noTxList=1')
//           .then(function (response) {
//             var balance = response.data   
//             res.status(200).json({balance:balance, txs:txs})
//           })
//           .catch(function (error) {
//             res.status(500).json(error.data)
//           }); 
//         })
//         .catch(function (error) {
//             axios.get(url+'/addr/'+add+'?noTxList=1')
//             .then(function (response) {
//               var balance = response.data   
//               res.status(200).json({balance:balance, txs:txs})
//             })
//             .catch(function (error) {
//               res.status(500).json(error.data)
//             });
//         }); 
//     }
// };

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
        let tx_url = txURL(add, chain, coin);
        let bl_url = balanceURL(add, chain, coin);
        
        axios.get(tx_url)
        .then(function (response) {
          let txs =  {txs:txParser(response.data, add)};
          axios.get(bl_url)
          .then(function (response) {
            let balArr = balParser(response.data);
            res.status(200).json({balance:balArr, txs:txs})
          })
        }).catch(function (error) {
            res.status(500).json(error.data)
        });

    }
};

exports.utxo = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var chain = req.query.chain;
        var coin = req.query.coin; 
        var add = req.query.address.split(",");

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

        axios.get(url+'/addrs/'+add+'/utxo')
        .then(function (response) {
            res.status(200).json(response.data)
        })
        .catch(function (error) {
            res.status(500).json(error.data)
        });
 
    }
};

exports.valid = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var address = req.query.address;
        var coin = req.query.coin; 
        var type = req.query.type; 

        let valid = validate_address.validate(address,coin,type);
        res.send(valid);
    }
};

function balanceURL(address, chain, coin){
    var url = "https://chain.api.btc.com/v3/address/"
    if (coin == "btc"){
       url = "https://chain.api.btc.com/v3/address/"
    } else if (coin == "bch"){
        url = "https://bch-chain.api.btc.com/v3/address/"
    }
    return url+address
}

function txURL(address, chain, coin){
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
    return url+'/addrs/'+address+'/txs'
}

function balParser(json){
    var balance=0.0,totalReceived=0.0,totalSent=0.0,
    unconfirmedBalance=0.0,unconfirmedReceived=0.0,unconfirmedSent=0.0;
    var data = json.data;
    if (data!=null){
        if (Object.getPrototypeOf( data ) === Object.prototype){
            data = [data];
        }
        for (var i=0;i<data.length;i++){
            var address = data[i];
            if (address!=null) {
                totalReceived = totalReceived+address.received;
                totalSent =totalSent+address.sent;
                unconfirmedReceived =unconfirmedReceived+address.unconfirmed_received;
                unconfirmedSent =unconfirmedSent+address.unconfirmed_sent;
                balance = balance+address.balance;
            }
        }
        unconfirmedBalance = unconfirmedReceived-unconfirmedSent;
    }

    return {data:data,totalReceived:totalReceived,balance:balance,
            totalSent:totalSent,unconfirmedBalance:unconfirmedBalance, unconfirmedReceived:unconfirmedReceived,
            unconfirmedSent:unconfirmedSent
        }
}

function txParser(json, addresses){
    var data = json.items;
    var add = addresses.split(",");
    var txs = [];
    var incoming = false;
    var value = 0.0;

    for (var i=0;i<data.length;i++){
        var inputs = data[i].vin;
        var outputs = data[i].vout;
        var tx= data[i];
        
        for(var j=0; j<inputs.length;j++){
            var vin = inputs[j];
            var addr = vin.addr;
            if (add.indexOf(addr) > -1){
                incoming = false;
                value = vin.value;
            }
        }

        for(var k=0; k<outputs.length;k++){
            var vout = outputs[k];
            var addrs = vout.scriptPubKey.addresses;
            if(addrs !=null){
                for(var l=0;l<addrs.length;l++){
                    if (add.indexOf(addrs[l]) > -1){
                        incoming = true;
                        value = parseFloat(vout.value);
                    }
                }
            }
        }
        tx.incoming = incoming;
        tx.amount = value;
        txs.push(tx);
    }    

    return txs
    
}
