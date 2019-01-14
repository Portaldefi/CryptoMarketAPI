var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinSchema = new Schema({
    name:String,
    icon:String,
    id:String,
    symbol:String,
    base:String,
    quote:String,
    exchange_id:[String], 
    change:Number,
    last:Number
}, { versionKey: false});

var TradeCoin = mongoose.model('TradeCoin', coinSchema);
module.exports = TradeCoin;

