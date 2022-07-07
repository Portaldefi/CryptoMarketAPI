const Alert = require('../models/Alert.js');
var User = require('../models/User');
let Queue = require("bull");
let REDIS_URL = process.env.REDIS_URL;

let alertQueue = new Queue('queue', REDIS_URL);

exports.create = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var device_id = req.query.dev_id;
    var coin = req.query.coin;
    var price = req.query.price;
    var id = req.query.id;

    var query = {id:id},
    update =  {id:id, price:price, symbol:coin, dev_id:device_id},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
  
    Alert.findOneAndUpdate(query, update, options, function(error, result) {
        if (error) return;
        res.status(200).json({
            message: 'Successfully created'
        });
    }); 

}

exports.delete = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var id = req.query.id;
    Alert.findOneAndRemove({id:id}, {_id:0, __v:0},function(err, ets) {
        res.status(200).json({
            message: 'Successfully removed'
        });
    });
}

exports.register_user = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var device_id = req.query.dev_id;
    var reg_id = req.query.token;
    var platform = req.query.platform;
    
    var query = {dev_id:device_id},
    update =  {dev_id:device_id, reg_id:reg_id, platform:platform},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
  
    User.findOneAndUpdate(query, update, options, function(error, result) {
        if (error) return;
        res.status(200).json({
            message: 'Successfully created'
        });
    });
}

exports.mock_notifier = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var device_id = req.query.dev_id;
    var coin = req.query.coin;
    var price = req.query.price;
    var id = req.query.id;
   
    alertQueue.add({ alert_token:device_id, alert_price:0});
}