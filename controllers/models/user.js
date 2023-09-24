const express = require("express");
const mongoose = require('mongoose'); 

const Userschema = new  mongoose.Schema({

    name:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    password:{
        type:String
    },

    isVerified: {
        type: Boolean,
        default: false,
      },

});



module.exports = mongoose.model("Users",Userschema);

