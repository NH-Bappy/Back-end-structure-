const express = require('express');
const _ = express.Router();
const userController = require('../../controller/user.controller')

_.route("/registration").post(userController.registration);
_.route("/verify-account").post(userController.verifyUser);
_.route("/resend-otp").post(userController.resendOtp);
_.route("/forgot-password").post(userController.forgetPassword);
_.route("/reset-password").post(userController.resetPassword);



module.exports = _;


// (req , res) => {
//     console.log("hello Bappy");
//     res.end("hi bappy")
// }