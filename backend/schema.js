const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:false
    },
    // firstname:{
    //     type:String,
    //     required:true
    // },
    // lastname:{
    //     type:String
    // },
    address:{
        type:String,
        required:false
    },
    about:{
        type:String,
        required:false
    },age:{type:Number,required:false}
})

module.exports =  mongoose.model('usermodel',userSchema);