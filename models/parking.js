const mongoose = require('mongoose');




const parkingSchema = mongoose.Schema({
    vnumber: String,
    vtype: String,
    vintime: String,
    vouttime: String,
    amountcharged: Number,
    status:String
    
})







module.exports= mongoose.model('parking',parkingSchema)
