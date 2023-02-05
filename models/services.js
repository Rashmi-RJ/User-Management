const mongoose = require('mongoose')




const serviceSchema = mongoose.Schema({
    image: String,
    serviceName: String,
    serviceDesc: String,
    serviceLongDesc: String,
    status: String,
    postedDate:Date
    
    
})

 module.exports= mongoose.model('service',serviceSchema)