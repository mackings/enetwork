const emailer = require('nodemailer');
const speakeasy = require('speakeasy');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendOTP(email) {
  const otp = speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    step: 300,
  });

  const msg = {
    to: email,
    from: 'Kayd@Enet.com', // Replace with your sender email address
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  return sgMail.send(msg);
}

function verifyOTP(storedOTP, userOTP) {
  const isValid = speakeasy.totp.verify({
    secret: storedOTP.secret,
    encoding: 'base32',
    token: userOTP,
    window: 1,
  });

  return isValid;
}

module.exports = {
  sendOTP,
  verifyOTP,
};