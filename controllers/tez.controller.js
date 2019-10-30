const async = require('async')
var asyncLoop = require('node-async-loop');
const axios = require('axios');



exports.get_tez_txs = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var add = req.query.address;
        let api = "https://api6.dunscan.io/v3/operations/"
        axios.get(api+add+'?type=Transaction')
        .then(function (response) {
            var txs = [];
            var list = response.data;
            for (var l=0;l<list.length;l++){
                var tx = list[l];
                var hash = tx.hash;
                var from = tx.type.source.tz;
                var operation = tx.type.operations[0];
                var to = operation.destination.tz;
                var amount = operation.amount;
                var failed = operation.failed;
                var incoming = true;
                var counter = operation.operation;
                var t = operation.timestamp;
                var fee = operation.fee;
                var timestamp = Math.round(new Date(t).getTime()/1000);
                if(from == add){
                    incoming = false;
                }
                var obj = {id:hash, from:from, to:to, amount:amount, incoming:incoming, 
                failed:failed, counter:counter, timestamp:timestamp, fee:fee};
                txs.push(obj);
            }
            res.status(200).json(txs)
        })
        .catch(function (error) {
            res.status(500).json(error.data)
        });
 
    }
};

function findTx(list){

    return txs
}