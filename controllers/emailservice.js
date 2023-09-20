const sgMail = require('@sendgrid/mail');
const speakeasy = require('speakeasy');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//sgMail.setApiKey("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");

class OTPService {
  constructor() {
    // Generate the OTP secret key during service initialization
    this.otpSecret = speakeasy.generateSecret().base32;
  }

  async sendOTP(email) {
    const otp = speakeasy.totp({
      secret: this.otpSecret,
      step: 300,
    });

    const msg = {
      to: email,
      from: 'Kayd@Enet.com', // Replace with your sender email address
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };

    try {
      const info = await sgMail.send(msg);
      console.log('OTP sent: ' + info.response);
      return true;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  }

  verifyOTP(userOTP) {
    const isValid = speakeasy.totp.verify({
      secret: this.otpSecret,
      encoding: 'base32',
      token: userOTP,
      window: 1,
    });

    return isValid;
  }
}

module.exports = OTPService;


// module.exports = {
//   sendOTP,
//   verifyOTP,
// };
