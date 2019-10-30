
const axios = require('axios');
const validate_address = require('cryptocurrency-address-validator');

exports.explorer_url = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var platform = req.query.platform;
        var id = req.query.tx_id; 
        var api = coinExplorer(platform,id);
        res.status(200).json({url:api})
    }
};



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

exports.address = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var chain = req.query.chain;
        var coin = req.query.coin; 
        var raw_add = req.query.address.split(',');
        var filter_add = raw_add.filter(function(e){return e});
        var add = filter_add.join(',');

        let tx_url = txURL(add, chain, coin);
        let bl_url = balanceURL(add, chain, coin);
        
        axios.get(tx_url)
        .then(function (response) {
          let txs =  {txs:txParser(response.data, add)};
          axios.get(bl_url)
          .then(function (response) {  
            let balArr = balParser(response.data);
            res.status(200).json({balance:balArr, txs:txs})
          }).catch(function (error) {
            let balarr = {data:data_adds,totalReceived:0,balance:0,
                        totalSent:0,unconfirmedBalance:0, unconfirmedReceived:0,
                        unconfirmedSent:0}
            res.status(200).json({balance:balarr, txs:txs})
          });
        }).catch(function (error) {
            res.status(500).json(error.data);
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

function coinExplorer(platform,id) {
    var api = "";
    if (platform == "BTC"){
        api = "https://blockchair.com/bitcoin/transaction/"+id;
    } else if (platform == "BCH"){
        api = "https://blockchair.com/bitcoin-cash/transaction/"+id;
    } else if (platform == "ETH"){
        api = "https://blockchair.com/ethereum/transaction/"+id;
    } else if (platform == "XLM"){
        api = "https://stellarscan.io/transaction/"+id;
    } else if (platform == "XTZ"){
        api = "https://dunscan.io/"+id;
    }
    return api
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

function balanceURL(address, chain, coin){
    var url = "https://api.blockchair.com/bitcoin/dashboards/addresses/"
    if (coin == "btc"){
       if (chain =="test"){
            url = "https://api.blockchair.com/bitcoin/testnet/dashboards/addresses/"
        } else {
            url = "https://api.blockchair.com/bitcoin/dashboards/addresses/"
        }
    } else if (coin == "bch"){
        if (chain =="test"){
            url = "https://api.blockchair.com/bitcoin-cash/testnet/dashboards/addresses/"
        } else {
            url = "https://api.blockchair.com/bitcoin-cash/dashboards/addresses/"
        }
    }
    return url+address
}

function balParser(json){
    var balance=0.0,totalReceived=0.0,totalSent=0.0,
    unconfirmedBalance=0.0,unconfirmedReceived=0.0,unconfirmedSent=0.0;
    var data = json.data;
    var data_adds = [];
    if (data!=null){
        var adds = data.addresses;
        var addresses = Object.keys(adds)
        for (var i=0;i<addresses.length;i++){
            var address = adds[addresses[i]];
            if (address!=null) {
                totalReceived = totalReceived+address.received;
                totalSent =totalSent+address.spent;
                unconfirmedReceived = parseInt(unconfirmedReceived);
                unconfirmedSent = parseInt(unconfirmedSent);
                balance = balance+address.balance;

                data_adds.push({address:addresses[i],received:address.received,sent:address.spent,balance:address.balance,
                    txCount:address.output_count,unconfirmedTxCount:0.0,unconfirmedReceived:0.0,unconfirmedSent:0.0,unspentTxCount:0.0,
                    firstTxId:'',lastTxId:''})
            }
        }
        unconfirmedBalance = parseInt(unconfirmedReceived-unconfirmedSent);
    }

    return {data:data_adds,totalReceived:totalReceived,balance:balance,
            totalSent:totalSent,unconfirmedBalance:unconfirmedBalance, unconfirmedReceived:unconfirmedReceived,
            unconfirmedSent:unconfirmedSent}
}

function txParser(json, addresses){
    var data = json.items;
    var add = addresses.split(",");
    var txs = [];
    var incoming = true;
    var my_add = false;
    var from = "";
    var to = "";
    var value = 0.0;

    for (var i=0;i<data.length;i++){
        var inputs = data[i].vin;
        var outputs = data[i].vout;
        var tx= data[i];

        for(var j=0; j<inputs.length;j++){
            my_add = false;
            incoming = true;
            var vin = inputs[j];
            var addr = vin.addr;
            from = addr;
            var exists_in_add = contains(add, addr);
            if (exists_in_add){
                incoming = false;
                my_add = true;
                break
            }
        }

        for(var k=0; k<outputs.length;k++){
            var vout = outputs[k];
            var addrs = vout.scriptPubKey.addresses;
            if(addrs !=null){
                if (my_add){
                    to = exclusionArr(add, addrs);
                    value = parseFloat(vout.value);
                    break
                } else {
                    var x = containsArr(add, addrs);
                    if (x!=""){
                        value = parseFloat(vout.value);
                        to = x;
                        break
                    }
                }
            }
        }

        tx.incoming = incoming;
        tx.amount = value;
        tx.from = from;
        tx.to = to;
        txs.push(tx);
    }    

    return txs
    
}

function exclusionArr(arr, arr1){
    var add = ""
    for(var i=0;i<arr1.length;i++){
        if (!(arr.indexOf(arr1[i]) > -1)){
            add = arr1[i];
            break
        } 
    }
    return add;
}

function containsArr(arr, arr1){
    var add = ""
    for(var i=0;i<arr1.length;i++){
        if ((arr.indexOf(arr1[i]) > -1)){
            add = arr[i];
            break
        } 
    }
    return add;
}

function contains(arr, ele){
    if (arr.indexOf(ele) > -1){
        return true
    } else {
        return false
    }
}