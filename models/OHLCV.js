var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ohlcvSchema = new Schema({
    fsym:String,
    tsym:String,
    exchange:String,
    min:[[Number,Number,Number,Number,Number,Number]],
    hour:[[Number,Number,Number,Number,Number,Number]],
    days:[[Number,Number,Number,Number,Number,Number]]
}, { versionKey: false});

var OHLCV = mongoose.model('OHLCV', ohlcvSchema);
module.exports = OHLCV;

