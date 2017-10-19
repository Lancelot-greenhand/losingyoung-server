var User = require('./user.js')
var uuidV1 = require('uuid/v1')
function insert(data){
    Object.assign(data, {
      register_date: new Date(),
      userId:uuidV1()
    }) 
    var newUser = new User(data)
   return newUser.save(function(err, res){
        if(err){
            console.log(`insert err: ${err}`)
        }else{
            console.log('insert success')
        }
        
    })
}

module.exports = insert