const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const usermodel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const saltrounds = 10;


exports.Register = async (req,res)=>{



    try {

    const hashedpassword = await bcrypt.hash(req.body.password,saltrounds);
    const User = new usermodel({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:hashedpassword
    });

    const finduser =  await usermodel.findOne({email:req.body.email});
    if (finduser) {
        
        res.status(500).json({
            error:"User Already Existss ",
            user:User.email,
            id:finduser._id
        });
        
    } else {
        User.save();
        res.status(200).json({
            message:"User Registered Successfully ",
            data:User._id

        });
        
    }

        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            error:"User Already Exist ",
        });
        
    }   

}
exports.login =  async  (req,res)=>{


    try {
        const userlogin = new usermodel({
            email:req.body.email,
            password:req.body.password
        });
          
        const euser =  await usermodel.findOne({email:req.body.email });
        const checkpass =  bcrypt.compareSync(req.body.password, euser.password);

        if (euser && checkpass) {
            const uemail = euser.email;
            console.log(uemail);
            const token = jwt.sign({uemail}, "jwt", {expiresIn:"1h"});
            res.status(200).json({
                message:"Sucessfully Logged in",
                id:euser._id,
                token:token,
                
            });
            console.log(token);
         
    
        } else if(euser){
            console.log("Account found but incorrect logins");
            res.status(500).json({
                message:"Incorret Login Details"
            });
        }else{
            console.log("Account not Found");
            res.status(404).json({
                message:"Account Not found"
            });

        }

        
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message:"User Was  Not found"
            
        });
        
    }



}