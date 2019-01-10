const Alert = require('../models/Alert.js');

exports.create = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var device_id = req.body.dev_id;
    var token = req.body.token;
    var coin = req.body.coin;
    var price = req.body.price;
    var id = req.body.id;

    var alert = new Alert({
        id:id,
        dev_id: device_id,
        symbol: coin,
        price: price,
        token:token 
    });

    alert.save(function(err) {
        if (err) throw err;
        console.log('Alert saved successfully!');
        res.status(200);
    });  

}

exports.delete = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var id = req.body.id;
    Alert.findOneAndRemove({id:id}, {_id:0, __v:0},function(err, ets) {

    });
    res.status(200);
}