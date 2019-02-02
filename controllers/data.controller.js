const cc = require('cryptocompare');
//cc.setApiKey('af16475c85c4892bc3ebd78cda62808e0b6685faa7bcee2c3e4908036dbf85be');

const async = require('async')
var moment = require('moment');

exports.price_full = (req, res) => {
    // Validate request
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var fsyms = req.query.fsyms;
        var tsyms = req.query.tsyms;
        cc.priceFull(fsyms,tsyms)
            .then(prices => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(prices));
        }).catch((error) => {
            res.send({message:error})
        });
    }
};

exports.price = (req, res) => {
    // Validate request
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var fsyms = req.query.fsyms;
        var tsyms = req.query.tsyms;
        cc.priceMulti(fsyms,tsyms)
        .then(prices => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(prices));
        }).catch((error) => {
            res.send({message:error})
        });
    }
};

var Daily = require('../models/Daily');

exports.history_day = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    // Validate request
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var fsyms = req.query.fsyms.toUpperCase().split(",");
        var tsym = req.query.tsym;
        var limit = req.query.limit;
        if (limit<1) {
            limit = 30
        }
        var st = moment().utc().subtract(limit,'days').startOf('day').unix('X')

        Daily.aggregate([
            {$match: {fsym: { $in: fsyms }}},
            {$unwind: "$price"},
            {'$match' : {'price.time': {'$gte': st }}},
            { $group : { _id : '$fsym',  data: { $push: "$price" } } }
            ],
            function(err,results) {
                var json = {};
                for (var i=0;i<results.length;i++){
                    var obj = results[i];
                    var sym = obj._id;
                    var dt = obj.data;
                    json[sym] = dt;
                }
                res.send(JSON.stringify(json));
            }
          )

    }
};

var Hourly = require('../models/Hourly');

exports.history_hour = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    // Validate request
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var fsyms = req.query.fsyms.toUpperCase().split(",");
        var tsym = req.query.tsym;
        var limit = req.query.limit;
        if (limit<1) {
            limit = 24
        }
        var st = moment().utc().subtract(limit,'hours').startOf('hour').unix('X')

        Hourly.aggregate([
            {$match: {fsym: { $in: fsyms }}},
            {$unwind: "$price"},
            {'$match' : {'price.time': {'$gte': st }}},
            { $group : { _id : '$fsym',  data: { $push: "$price" } } }
            ],
            function(err,results) {
                var json = {};
                for (var i=0;i<results.length;i++){
                    var obj = results[i];
                    var sym = obj._id;
                    var dt = obj.data;
                    json[sym] = dt;
                }
                res.send(JSON.stringify(json));
            }
          )

    }
};


var Minutely = require('../models/Minutely');

exports.history_minute = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    // Validate request
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var fsyms = req.query.fsyms.toUpperCase().split(",");
        var tsym = req.query.tsym;
        var limit = req.query.limit;
        if (limit<1) {
            limit = 60
        }

        Minutely.find({fsym:{$in:fsyms}},{'price':{'$slice':-1*limit}}, function(err, results){
            var json = {};
            for (var i=0;i<results.length;i++){
                var obj = results[i];
                var sym = obj.fsym;
                var dt = obj.price;
                json[sym] = dt;
            }
            res.send(JSON.stringify(json));
        })

    }
};