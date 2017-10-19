const mongoose = require('../../db/db.js')

const UserLoginValidate = mongoose.Schema({
    account: {type: String, required: true},
    b_id: {type: String, required: false},
    login_token: {type: String, required: false}
})
const Model = mongoose.model('user_login_validate', UserLoginValidate)
module.exports = Model