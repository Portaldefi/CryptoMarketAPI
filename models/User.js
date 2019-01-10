var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    id:String,
    dev_id:String,
    reg_id:String
}, { versionKey: false});

var User = mongoose.model('User', userSchema);
module.exports = User;

