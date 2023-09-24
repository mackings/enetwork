const sgMail = require('@sendgrid/mail');
const speakeasy = require('speakeasy');
require('dotenv').config();
const nodemailer = require('nodemailer');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// class OTPService {
//   constructor() {
//     this.otpSecret = speakeasy.generateSecret().base32;
//   }

//   async sendOTP(email) {
//     const otp = speakeasy.totp({
//       secret: this.otpSecret,
//       step: 300,
//     });

//     const msg = {
//       to: email,
//       from: 'Macsonline500@gmail', 
//       subject: '<<C21B4D44-9C94-48C5-920B-2BFFF7705058>>',
//       text: `Mail from Macsonline500@gmail.com on Sendgrid`,
//      // text: `Your OTP code is: ${otp}`,
//     };

//     try {
//       const info = await sgMail.send(msg);
//       console.log('OTP sent: ' + info.response);
//       return true;
//     } catch (error) {
//       console.error(error.message);
//       return false;
//     }
//   }

//   verifyOTP(userOTP) {
//     const isValid = speakeasy.totp.verify({
//       secret: this.otpSecret,
//       encoding: 'base32',
//       token: userOTP,
//       window: 1,
//     });

//     return isValid;
//   }
// }

// module.exports = OTPService;


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
      const otp = speakeasy.totp({
        secret: this.otpSecret,
        step: 600,
      });
  
      const mailOptions = {
        from: 'Macsonline500@gmail.com', // Your Gmail email address
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
      window: 3,
    };
  
    try {
      const isValid = speakeasy.totp.verify(otpDetails);
      console.log('Is Valid OTP?', isValid);
      console.log('OTP Details:', otpDetails);
      return isValid;
    } catch (error) {
      console.error('Error during OTP verification:', error);
      return false;
    }
  }
  
}

module.exports = OTPService;