var mongoose = require('../../db/db.js')

var UserSchema = mongoose.Schema({
    userId: {type: String, required: true},
    account: {type: String, required: true},
    pwd: {type: String, required: true},
    user_name: {type: String, required: true},
    e_mail: {type: String},
    tel: {type: String},
    register_date: {type: Date, default: Date.now()}
})
var UserModel = mongoose.model('user', UserSchema)
module.exports = UserModel