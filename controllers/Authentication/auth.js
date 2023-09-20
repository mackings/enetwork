const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const usermodel = require("../models/user");
const beneficiary = require("../models/beneficiary");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const saltrounds = 10;
const otpService = require("../emailservice");


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
        
        res.status(200).json({
            error:"User Already Existss ",
            user:User.email,
            id:finduser._id
        });
        
    } else {
        User.save();
        res.status(200).json({
            status:"Success",
            message:"User Registered Successfully ",
            data:User._id

        });
        
    }
 
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            status:"Error",
            error:"User Already Exist ",
        });
        
    }   

},

exports.Sendotp = async (req,res)=>{

    try {
        const email = req.body.email;

        try {
          const info = await otpService.sendOTP(email);
          console.log('OTP sent: ' + info.response);
          res.status(200).send('OTP sent successfully');
        } catch (error) {
          console.error(error);
          res.status(500).send('Error sending OTP email');
        }

        
    } catch (error) {
        
    }

},



exports.Verifyotp = async (req,res)=>{

    try {

        const userOTP = req.body.otp;
        const storedOTP = otpService.otp; 
      
        if (!storedOTP) {
          return res.status(400).send('OTP not found');
        }
      
        const isValid = otpService.verifyOTP(storedOTP, userOTP);
      
        if (isValid) {
          res.status(200).send('OTP is valid');
        } else {
          res.status(401).send('Invalid OTP');
        }

        
    } catch (error) {
        
    }

},


exports.login = async (req, res) => {
    try {
        const euser = await usermodel.findOne({ email: req.body.email });

        if (euser) {
            const checkpass = bcrypt.compareSync(req.body.password, euser.password);

            if (checkpass) {
                const uemail = euser.email;
                console.log(uemail);
                const token = jwt.sign({ uemail }, "jwt", { expiresIn: "1h" });
                const benefit = await beneficiary.find({ user: euser._id });

                res.status(200).json({
                    status: "Success",
                    message: "Successfully Logged in",
                    id: euser._id,
                    token: token,
                    beneficiaries: benefit
                });
                console.log(token);
            } else {
                console.log("Incorrect login details");
                res.status(500).json({
                    status: "Error",
                    message: "Incorrect Login Details"
                });
            }
        } else {
            console.log("Account not found");
            res.status(404).json({
                message: "Account Not Found"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred"
        });
    }
};



exports.addBeneficiary = async (req, res) => {
    try {
        const newBeneficiary = new beneficiary({
            user: req.body._id, 
            name: req.body.name,
            email: req.body.email,
            walletAddress: req.body.walletAddress
        });

        const savedBeneficiary = await newBeneficiary.save();
        res.status(201).json({
            status: "Success",
            message: "Beneficiary added successfully",
            beneficiary: savedBeneficiary
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred"
        });
    }
};



exports.removeBeneficiary = async (req, res) => {
    try {
        const beneficiaryId = req.params.id; 
        
        const removedBeneficiary = await beneficiary.findByIdAndRemove(beneficiaryId);

        if (!removedBeneficiary) {
            return res.status(404).json({
                status: "Error",
                message: "Beneficiary not found"
            });
        }

        res.status(200).json({
            status: "Success",
            message: "Beneficiary removed successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred"
        });
    }
};