var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ohlcvaSchema = new Schema({
    fsym:String,
    tsym:String,
    min:[[Number,Number,Number,Number,Number,Number]],
    hour:[[Number,Number,Number,Number,Number,Number]],
    days:[[Number,Number,Number,Number,Number,Number]]
}, { versionKey: false, _id:false});

var OHLCVA = mongoose.model('OHLCVA', ohlcvaSchema);
module.exports = OHLCVA;

