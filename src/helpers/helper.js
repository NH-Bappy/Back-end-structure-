const nodemailer = require("nodemailer");
require('dotenv').config()
const crypto = require('crypto')

// this is send mail engine
const transporter = nodemailer.createTransport({
    service: "gmail",
    secure:process.env.NODE_ENV == "development"? false : true,
    auth: {
        user: process.env.HOST_MAIL,
        pass: process.env.HOST_PASSWORD,
    },
}); 

// send mail to registered user

exports.emailSend = async (email, template, subject) => {
  const info = await transporter.sendMail({
    from: `"The Job Box" <${process.env.HOST_MAIL}>`,
    to: Array.isArray(email) ? email.join(',') : email,
    subject: subject,
    html: template, // send design as HTML
  });
  console.log("Message sent:", info.messageId);
  return info.messageId;
};

// make otp

exports.Otp = () => {
   return crypto.randomInt(10000 , 99999)
}