var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ohlcvcSchema = new Schema({
    fsym:String,
    tsym:String,
    interval:String,
    price:[Object]
}, { versionKey: false});

var OHLCVC = mongoose.model('OHLCVC', ohlcvcSchema);
module.exports = OHLCVC;

