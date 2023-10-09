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
const crypto = require('crypto');

const accountsid = process.env.ACCOUNTSID;
const authtoken = process.env.AUTHTOKEN;
const client = require('twilio')(accountsid,authtoken);


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
        res.status(200).json({
          status:"Success",
          message:"OTP sent Successfully"
        })
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
  
        res.status(200).json({
          status:"Success",
          message:"OTP verified Successfully"
        })
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
    const  email  = req.body.email;
  
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
  
      user.resetToken = resetToken;
      user.resetTokenExpires = resetTokenExpires;
      await user.save();
      const isSent = await otpService.sendOTP(email);
  
      if (isSent) {
        res.status(200).json({
          status: 'Success',
          message: 'Password reset email sent successfully',
        });
      } else {
        console.error('Error sending OTP email');
        res.status(500).json({
          status: 'Error',
          message: 'Error sending OTP email',
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'Error',
        message: 'An error occurred while processing the request',
      });
    }
  };
  



  exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword, identifier } = req.body;
  
    try {
      const isValidToken = otpService.verifyOTP(resetToken);
  
      if (!isValidToken) {
        return res.status(401).json({
          status: 'Error',
          message: 'Invalid or expired reset token',
        });
      }
  

      const user = await usermodel.findOne({
        email: identifier, 
      });
  
      if (!user) {
        return res.status(404).json({
          status: 'Error',
          message: 'User not found',
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
  

  exports.Sendsms = async (req, res) => {
    const phone = req.body.phone;
    const msg = req.body.msg;
  
    try {
      // Send SMS
      const message = await client.messages.create({
        body: msg,
        from: '+15077085901',
        to: phone,
      });
  
      // Log the message SID
      console.log(message.sid);
  
      res.status(200).json({
        status: 'Success',
        message: 'Message OTP sent to ' + phone,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'Error',
        message: 'Could not send SMS',
      });
    }
  };

  exports.CreateVerifyService = async (req, res) => {
    try {
        const service = await client.verify.v2.services.create({
            friendlyName: 'Enetworks'
        });
        console.log(service.sid);

        res.status(200).json({
            status: "Success",
            message: "Verify Service created with SID: " + service.sid
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "Error",
            message: "Could not create Verify Service"
        });
    }
};

exports.SendvCode = async (req, res) => {

  const phone = req.body.phone;

  try {
      const verification = await client.verify.v2.services(process.env.VCODE)
          .verifications
          .create({ to: phone, channel: 'sms' });
      
      console.log(verification.status);

      res.status(200).json({
          status: "Success",
          message: "Verification code sent with status: " + verification.status
      });
  } catch (error) {
      console.error(error);

      res.status(500).json({
          status: "Error",
          message: "Could not send verification code"
      });
  }
};

exports.Checkvcode = async (req, res) => {
  const phone = req.body.phone; 
  const code = req.body.code; 

  try {
      const verificationCheck = await client.verify.v2.services(process.env.VCODE)
          .verificationChecks
          .create({to:phone, code:code });
      
      console.log(verificationCheck.status);

      res.status(200).json({
          status: "Success",
          message: "Verification code check with status: " + verificationCheck.status
      });
  } catch (error) {
      console.error(error);

      res.status(500).json({
          status: "Error",
          message: "Could not check verification code"
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
        res.status(200).json({
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