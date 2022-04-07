require('dotenv').config();
const mongoose = require('mongoose');
const CoinpaprikaAPI = require('@coinpaprika/api-nodejs-client');
let Queue = require("bull");
let REDIS_URL = process.env.REDIS_URL

mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;
mongoose.connection
    .on('connected', () => {
    console.log(`Mongoose connection open on ${process.env.DATABASE}`);
})
.on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
});
const async = require('async')

var Alert = require('../models/Alert');
var User = require('../models/User');

let alertQueue = new Queue('queue', REDIS_URL);

sendAlerts();

function sendAlerts(){
    const client = new CoinpaprikaAPI();

    // find all alerts, group them by symbol
    Alert.aggregate([
        {
            $group: {
                _id: '$symbol',
                data : {"$push" : "$$ROOT"}
            }
        },
        {$project : {
            data : "$data",
            _id:1,
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } else {
            for(var j=0;j<result.length;j++){
                var obj = result[j]
                var symbol = obj._id;
                
                client.getAllTickers({
                    coinId:'btc-bitcoin',
                    quotes: ['USD']
                }).then(
                    function(val) {
                        if (!isEmpty(val)){
                            if ('quotes' in val) {
                                var price = val.quotes.USD.price;
                                for (var i=0;i<obj.data.length;i++){
                                    var data = obj.data[i];
                                    var alert_price = data.price;
                                    var alert_token = "";
                                    var alert_dev_id = data.dev_id;
                                    if (inMargin(alert_price,price) ){
                                        User.find({dev_id:alert_dev_id},function(err,user){
                                            alert_token = user.reg_id;
                                            alertQueue.add({ alert_token:alert_token, alert_price:alert_price});
                                            removeAlert(data.id)
                                        });  
                                    }
                                }
                            }
                        }
                    }
                ).catch(console.error);
            }
        }
    });
}


function removeAlert(id){
    Alert.findOneAndRemove({id:id}, {_id:0, __v:0},function(err, ets) {});
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function inMargin(alert_price,current_price) {
    var margin = Math.abs((alert_price - current_price)*100/current_price);
    if (margin > 5){
        return true
    } else {
        return false
    }
}