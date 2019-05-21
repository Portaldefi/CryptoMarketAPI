var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assetSchema = new Schema({
    id:Number,
    name:String,
    symbol:String,
    icon:String,
    exchange:[{id:String,_id:false,active:Boolean,deposit:Boolean,withdraw:Boolean}],
    platform:Object
    }, { versionKey: false});

var ExchangeAsset = mongoose.model('ExchangeAsset', assetSchema);
module.exports = ExchangeAsset;

