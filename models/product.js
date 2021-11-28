var mongoose = require('mongoose')

//  Product Schema
var ProductSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    slug:{
        type:String,
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    price:{
        type: Number,
        required: true
    },
    image:{
        type: String
    }
})

module.exports =  mongoose.model("Product", ProductSchema)