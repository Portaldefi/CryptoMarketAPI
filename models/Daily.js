var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dailySchema = new Schema({
    fsym:String,
    tsym:String,
    price:[
            {
                time:Number, 
                open:Number, 
                close:Number, 
                high:Number, 
                low:Number,
                _id:false,
            }
    ]
}, { versionKey: false});

var Daily = mongoose.model('Daily', dailySchema);
module.exports = Daily;

