var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ohlcvaSchema = new Schema({
    fsym:String,
    tsym:String,
    type:String,
    interval:String,
    exchanges:[String],
    price:[Object]
}, { versionKey: false, _id:false});

var OHLCVA = mongoose.model('OHLCVA', ohlcvaSchema);
module.exports = OHLCVA;

