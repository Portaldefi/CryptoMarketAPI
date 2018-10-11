var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinSchema = new Schema({
    id:Number,
    name:String,
    symbol:String,
    icon:String
}, { versionKey: false});

var Coin = mongoose.model('Coin', coinSchema);
module.exports = Coin;

