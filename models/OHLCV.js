var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ohlcvSchema = new Schema({
    fsym:String,
    tsym:String,
    exchange:String,
    interval:String,
    price:[
            {
                time:Number, 
                open:Number, 
                close:Number, 
                high:Number, 
                low:Number,
                volumefrom:Number,
                volumeto:Number,
                _id:false,
            }
    ]
}, { versionKey: false});

var OHLCV = mongoose.model('OHLCV', ohlcvSchema);
module.exports = OHLCV;

