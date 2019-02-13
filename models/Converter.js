var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var converterSchema = new Schema({
    symbol:String,
    price:[Object]
}, { versionKey: false});

var converter = mongoose.model('Converter', converterSchema);
module.exports = converter;

