const mongoose = require('mongoose');





const regSchema = mongoose.Schema({
    username: String,
    password: String,
    status: String,
    roles: String,
    firstname: String,
    lastname: String,
    email: String,
    image:String,
})

module.exports= mongoose.model('reg',regSchema)