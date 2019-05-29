require('dotenv').config();
const mongoose = require('mongoose');

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
var Price = require('../models/Minutely');
var Push = require('../push.js');

var apn = require('apn');
var apnsoptions = {
    token: {
      key: "public/push/AuthKey_FM695U6F8J.p8",
      keyId: "FM695U6F8J",
      teamId: "HBPT8C8527"
    },
    production: false
};

sendAlerts();

function sendAlerts(){
    //create a connection
    var apnProvider = new apn.Provider(apnsoptions);

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
            var alert_symbols = result.map(a => a._id);
            Price.find({'fsym':{$in:alert_symbols}}, function(err, res){
                for(var j=0;j<res.length;j++){
                    var symbol = res[j];
                    var price = symbol.price;
                    if (price.length>0) {
                        var close_price = price.pop().close;
                        var alerts = result.find(x => x._id === symbol.fsym);
                        if(alerts!=undefined){
                            for (var i=0;i<alerts.data.length;i++){
                                var data = alerts.data[i];
                                var alert_price = data.price;
                                var alert_token = "";
                                var alert_dev_id = data.dev_id;
                                if (alert_price<=close_price){
                                    User.find({dev_id:alert_dev_id},function(err,user){
                                        alert_token = user.reg_id;
                                        Push.send_ios_notification(alert_token,alert_price,apnProvider);
                                        removeAlert(data.id)
                                    });  
                                }
                            }
                        }
                    }
                }
            })
        }
    });

    // shutdown connection
    apnProvider.shutdown();
}

function removeAlert(id){
    Alert.findOneAndRemove({id:id}, {_id:0, __v:0},function(err, ets) {});
}