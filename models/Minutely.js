var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var minSchema = new Schema({
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

var Minutely = mongoose.model('Minutely', minSchema);
module.exports = Minutely;

