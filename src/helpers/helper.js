const nodemailer = require("nodemailer");
require('dotenv').config()


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

exports.emailSend = async() => {
      const info = await transporter.sendMail({
    from: 'end_website',
    to: "naimulbappy2207@gmail.com",
    subject: "confirm registration",
    html: "<b>Hello world?</b>", // HTML body
  });

  console.log("Message sent:", info.messageId);
}


