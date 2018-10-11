var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hourlySchema = new Schema({
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
}, { versionKey:false});

var Hourly = mongoose.model('Hourly', hourlySchema);
module.exports = Hourly;

