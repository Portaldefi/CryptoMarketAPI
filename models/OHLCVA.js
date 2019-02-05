var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ohlcvaSchema = new Schema({
    fsym:String,
    tsym:String,
    interval:String,
    price:[[Number,Number,Number,Number,Number,Number]]

}, { versionKey: false});

var OHLCVA = mongoose.model('OHLCVA', ohlcvaSchema);
module.exports = OHLCVA;

