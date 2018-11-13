
exports.create = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var device_id = req.body.dev_id;
    var token = req.body.token;
    var coin = req.body.coin;
    var price = req.body.price;
    var id = req.body.id;
    res.status(200);
}

exports.delete = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var id = req.body.id;
    res.status(200);
}