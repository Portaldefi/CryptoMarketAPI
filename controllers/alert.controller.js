const Alert = require('../models/Alert.js');
var User = require('../models/User');

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
