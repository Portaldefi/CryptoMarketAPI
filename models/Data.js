var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dataSchema = new Schema({
    coin:  String,
    name: String,
    place: String,
    origin: [Number],
    route: [[Number, Number]],
    time:[Number],
    speed:[Number],
    focus:Number
});

var Data = mongoose.model('Data', dataSchema);
module.exports = Data;

