const { default: mongoose } = require('mongoose');
const mongoosee = require('mongoose');
const { schema } = require('./adminlogin');



const bannerSchema = mongoose.Schema({
    title: String,
    desc: String,
    longdesc: String,
    bannerImage:String
})








module.exports=mongoose.model('banner',bannerSchema)