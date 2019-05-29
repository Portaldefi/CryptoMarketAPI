var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var alertSchema = new Schema({
    id:String,
    dev_id:String,
    symbol:String,
    price:Number,
    percent:Number
}, { versionKey: false});

var Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;

