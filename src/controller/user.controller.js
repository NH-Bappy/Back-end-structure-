const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../utils/customError");
const userModel = require('../models/user.model');
const { validateUser } = require("../validation/user.validation");
const { registrationTemplate } = require("../template/emailTemplate");
const { Otp, emailSend } = require('../helpers/helper')

exports.registration = asyncHandler(async (req, res) => {
    // console.log("he stop")
    // res.send("OK") 

    // apiResponse.sendSuccess(res , 201, "registrationSuccessful" , {data:'null'})
    // throw new customError(404 , "email Missing")

    // const {email , password} = req.body;
    // console.log(email , password)

    // console.log(Otp())

    const value = await validateUser(req)
    // console.log(value)


    //now save the user into database
    const user = await new userModel({
        name: value.name, // this from user schema and i get this value from postman (e.g name , email ,password)
        email: value.email || null,
        password: value.password,
        phoneNumber: value.phoneNumber || null,
    }).save()

    if (!user) {
        throw new CustomError(501, "user is not registered server error")
    }

    // send confirm registration mail
    const verifyEmailLink = `www.frontend.com/verifyEmail${user.email}`
    user.sendOtp = Otp();
    user.OtpExpiresTime = Date.now() + 10 * 60 * 1000;
    const template = registrationTemplate(
        user.name,
        user.email,
        user.sendOtp,
        user.OtpExpiresTime,
        verifyEmailLink
    );

    // send email
    const result = await emailSend(user.email, template, "Confirm Your Email");
    if (!result) {
        throw new CustomError(501, 'email send fail')
    }
    await user.save();
    apiResponse.sendSuccess(res, 201, "registration successful")
});



