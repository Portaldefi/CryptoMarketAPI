var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ohlcvaSchema = new Schema({
    fsym:String,
    tsym:String,
    interval:String,
    exchanges:[String],
    price:[[Number,Number,Number,Number,Number,Number]]
}, { versionKey: false, _id:false});

var OHLCVA = mongoose.model('OHLCVA', ohlcvaSchema);
module.exports = OHLCVA;

