const Alert = require('../models/Alert.js');
var User = require('../models/User');

exports.create = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var device_id = req.body.dev_id;
    var coin = req.body.coin;
    var price = req.body.price;
    var id = req.body.id;

    var alert = new Alert({
        id:id,
        dev_id: device_id,
        symbol: coin,
        price: price
    });

    alert.save(function(err) {
        if (err) throw err;
        res.status(200);
    });  

}

exports.delete = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var id = req.body.id;
    Alert.findOneAndRemove({id:id}, {_id:0, __v:0},function(err, ets) {
        res.status(200);
    });
}

exports.register_user = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var device_id = req.body.dev_id;
    var reg_id = req.body.token;
    var platform = req.body.platform;

    var user = new User({
        dev_id: device_id,
        reg_id: reg_id,
        platform: platform
    });

    user.save(function(err) {
        if (err) throw err;
        res.status(200);
    });  

}