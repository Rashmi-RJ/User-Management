const mongoose = require('mongoose');




 const testiSchema =mongoose.Schema({
     post: String,
     cname: String,
     status: String,
     postedDate: Date,
     userImage:String
})


module.exports= mongoose.model('test',testiSchema)