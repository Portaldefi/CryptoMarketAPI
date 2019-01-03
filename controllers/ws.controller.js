var ccxt = require ('ccxt');

exports.symbols = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json(list);
}



