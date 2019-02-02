var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinSchema = new Schema({
    name:String,
    icon:String,
    quote_icon:String,
    quote_name:String,
    id:String,
    symbol:String,
    base:String,
    quote:String,
    exchange:[{id:String,sym:String,bVol:Number,qVol:Number,price:Number,_id:false}], 
    change:Number,
    last:Number
}, { versionKey: false, _id:false});

var TradeCoin = mongoose.model('TradeCoin', coinSchema);
module.exports = TradeCoin;

