var mongoose = require('mongoose'),
user = 'yangrw2017',
pass = 'luyangrw!2@17-',
DB_URL = 'mongodb://localhost:20507/losingyoung'

mongoose.Promise = global.Promise
// mongoose.connect(DB_URL,{user, pass})
mongoose.connect(DB_URL, {
    useMongoClient: true
})
var db = mongoose.connection
db.on('connected', function(){
console.log(`MongoConnection open to ${DB_URL}`)
})
db.on('err', function(err){
console.log(`mongo connection err: ${err}`)
})
db.on('disconnected', function(){
console.log('mongoDB disconnected')
})

module.exports = mongoose