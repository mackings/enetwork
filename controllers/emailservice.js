const sgMail = require('@sendgrid/mail');
const speakeasy = require('speakeasy');
require('dotenv').config();
const nodemailer = require('nodemailer');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


class OTPService {
  constructor() {
    this.otpSecret = speakeasy.generateSecret({ length: 10 }).base32;
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendOTP(email) {
    try {
      const otp = speakeasy.time({
        secret: this.otpSecret,
        step: 600,
        encoding:"base32",
        window:0
      });
  
      const mailOptions = {
        from: 'Macsonline500@gmail.com', 
        to: email,
        subject: 'Verification Code',
        text: `Your OTP code is: ${otp}`,
      };
  
      const info = await this.transporter.sendMail(mailOptions);
      console.log('OTP sent: ' + info.response);
      console.log('Generated OTP:', otp);
      console.log(this.otpSecret);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return false;
    }
  }
  

  verifyOTP(userOTP) {
    const otpDetails = {
      secret: this.otpSecret,
      encoding: 'base32',
      token: userOTP,
      window: 0,
      step:600
    };
  
    try {
      const isValid = speakeasy.time.verify(otpDetails);
      console.log('Is Valid OTP?', isValid);
      console.log('OTP Details:', otpDetails);
      console.log(isValid);
      return isValid;
    } catch (error) {
      console.error('Error during OTP verification:', error);
      console.log(Date);
      return false;
    }
  }
  
}

module.exports = OTPService;