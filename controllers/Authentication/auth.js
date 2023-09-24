const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const usermodel = require("../models/user");
const beneficiary = require("../models/beneficiary");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const saltrounds = 10;
const OTPService = require('../emailservice'); 

const otpService = new OTPService();


exports.Register = async (req,res)=>{



    try {

    const hashedpassword = await bcrypt.hash(req.body.password,saltrounds);
    const User = new usermodel({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:hashedpassword,
        isVerified: false,
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
            data:User

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

exports.Sendotp = async (req, res) => {
    try {
      const email = req.body.email;
  
      const isSent = await otpService.sendOTP(email);
  
      if (isSent) {
        console.log('OTP sent successfully');
        res.status(200).send('OTP sent successfully');
      } else {
        console.error('Error sending OTP email');
        res.status(500).send('Error sending OTP email');
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal server error');
    }
  };



  exports.Verifyotp = async (req, res) => {
    try {
      const userOTP = req.body.otp;
  
      const isValid = otpService.verifyOTP(userOTP);
  
      if (isValid) {
        console.log('OTP is valid');

        const user = await usermodel.findOneAndUpdate(
          { email: req.body.email },
          { isVerified: true }
        );
  
        if (!user) {
          console.error('User not found');
          return res.status(404).send('User not found');
        }
  
        res.status(200).send('OTP Verified');
      } else {
        console.error('Invalid OTP');
        res.status(401).send('Invalid OTP');
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal server error');
    }
  };
  


  exports.login = async (req, res) => {
    try {
      const euser = await usermodel.findOne({ email: req.body.email });
  
      if (euser) {

        if (!euser.isVerified) {
          console.log('User is not verified');
          return res.status(401).json({
            status: 'Error',
            message: 'User is not verified',
          });
        }
  
        const checkpass = bcrypt.compareSync(req.body.password, euser.password);
  
        if (checkpass) {
          const uemail = euser.email;
          console.log(uemail);
          const token = jwt.sign({ uemail }, 'jwt', { expiresIn: '1h' });
          const benefit = await beneficiary.find({ user: euser._id });
  
          res.status(200).json({
            status: 'Success',
            message: 'Successfully Logged in',
            id: euser._id,
            token: token,
            beneficiaries: benefit,
          });
          console.log(token);
        } else {
          console.log('Incorrect login details');
          res.status(500).json({
            status: 'Error',
            message: 'Incorrect Login Details',
          });
        }
      } else {
        console.log('Account not found');
        res.status(404).json({
          message: 'Account Not Found',
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 'Error',
        message: 'An error occurred',
      });
    }
  };
  



exports.requestResetToken = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await usermodel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({
          status: 'Error',
          message: 'User not found',
        });
      }
  
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour
  
      // Save the reset token and its expiration time to the user document
      user.resetToken = resetToken;
      user.resetTokenExpires = resetTokenExpires;
      await user.save();
  
      // Send an email to the user with a link containing the reset token
      const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
      const emailMessage = `To reset your password, click the following link: ${resetLink}`;
      
      // Send the email with the reset link (you can use your email service)
      // Example: emailService.sendEmail(user.email, 'Password Reset', emailMessage);
  
      res.status(200).json({
        status: 'Success',
        message: 'Password reset email sent successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'Error',
        message: 'An error occurred while processing the request',
      });
    }
  };



  exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
  
    try {
      const user = await usermodel.findOne({
        resetToken: resetToken,
        resetTokenExpires: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(401).json({
          status: 'Error',
          message: 'Invalid or expired reset token',
        });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, saltrounds);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
  
      await user.save();
  
      res.status(200).json({
        status: 'Success',
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'Error',
        message: 'An error occurred while processing the request',
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