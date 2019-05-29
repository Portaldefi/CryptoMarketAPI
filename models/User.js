var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    dev_id:String,
    reg_id:String,
    platform:String
}, { versionKey: false});

var User = mongoose.model('User', userSchema);
module.exports = User;

