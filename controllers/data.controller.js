const cc = require('cryptocompare')
const async = require('async')

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

exports.history_day = (req, res) => {
    // Validate request
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var fsyms = req.query.fsyms.split(",");
        var tsym = req.query.tsym;
        var limit = req.query.limit;
        var data = [];
        res.setHeader('Content-Type', 'application/json');
        var counter = 0;
        async.each(fsyms, function(item, callback) {
            counter++;
            console.log('Processing ' + item)
            setTimeout(function(){
                cc.histoDay(item,tsym,{limit:limit})
                .then(prices => {
                    var obj = {};
                    obj[item] = prices;
                    data.push(obj);
                    if (counter==fsyms.length){
                        callback(null)
                    }
                }).catch((error) => {
                    callback(error)
                });
            }, 200); 
          }, function(err) {
            if(err) {
              console.log('A element failed to process', err)
              res.status(500).json(err)
            } else {
              console.log('All elements have been processed successfully')
              res.status(200).json(data) 
            }
          })

    }
};

exports.history_hour = (req, res) => {
    // Validate request
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var fsyms = req.query.fsyms.split(",");
        var tsym = req.query.tsym;
        var limit = req.query.limit;
        var data = [];
        res.setHeader('Content-Type', 'application/json');
        var counter = 0;
        async.each(fsyms, function(item, callback) {
            counter++;
            console.log('Processing ' + item)
            setTimeout(function(){
                cc.histoHour(item,tsym,{limit:limit})
                .then(prices => {
                    var obj = {};
                    obj[item] = prices;
                    data.push(obj);
                    if (counter==fsyms.length){
                        callback(null)
                    }
                }).catch((error) => {
                    callback(error)
                });
            }, 200); 
          }, function(err) {
            if(err) {
              console.log('A element failed to process', err)
              res.status(500).json(err)
            } else {
              console.log('All elements have been processed successfully')
              res.status(200).json(data) 
            }
          })

    }
};

exports.history_minute = (req, res) => {
    // Validate request
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var fsyms = req.query.fsyms.split(",");
        var tsym = req.query.tsym;
        var limit = req.query.limit;
        var data = [];
        res.setHeader('Content-Type', 'application/json');
        var counter = 0;
        async.each(fsyms, function(item, callback) {
            counter++;
            console.log('Processing ' + item)
            setTimeout(function(){
                cc.histoMinute(item,tsym,{limit:limit})
                .then(prices => {
                    var obj = {};
                    obj[item] = prices;
                    data.push(obj);
                    if (counter==fsyms.length){
                        callback(null)
                    }
                }).catch((error) => {
                    callback(error)
                });
            }, 200); 
          }, function(err) {
            if(err) {
              console.log('A element failed to process', err)
              res.status(500).json(err)
            } else {
              console.log('All elements have been processed successfully')
              res.status(200).json(data) 
            }
          })

    }
};