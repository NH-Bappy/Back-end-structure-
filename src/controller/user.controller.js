const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../utils/customError");
const userModel = require('../models/user.model');
const { validateUser } = require("../validation/user.validation");
const { registrationTemplate, resendOtpTemplate } = require("../template/emailTemplate");
const { Otp, emailSend } = require('../helpers/helper')


// user registration
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
    user.resetPasswordOTP = Otp();
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    const template = registrationTemplate(user.name,user.email,user.resetPasswordOTP,user.resetPasswordExpires,verifyEmailLink);

    // send email to customer
    const result = await emailSend(user.email, template, "Confirm Your Email");
    if (!result) {
        throw new CustomError(501, 'email send fail')
    }
    await user.save();
    apiResponse.sendSuccess(res, 201, "registration successful")
});


//verify your email
exports.verifyUser = asyncHandler(async (req, res) => {
    const { email, Otp } = req.body;
    if (!Otp) {
        throw new CustomError(401, "your otp is missing")
    }
    //now find the otp from database and verify otp
    const validUser = await userModel.findOne({ email })
    if (!validUser) {
        throw new CustomError(401, "user not found")
    }
    if (email && validUser.resetPasswordOTP == Otp && validUser.resetPasswordExpires > Date.now()) {
        validUser.emailVerified = true
        validUser.isActive = true
        validUser.resetPasswordOTP = null
        validUser.resetPasswordExpires = null
        await validUser.save()
    }
    apiResponse.sendSuccess(res, 201, "your account is verified", { name: validUser.name })
    console.log(validUser)
})

// resend otp

exports.resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    user.resetPasswordOTP = Otp();
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    if (email) {
        const template = resendOtpTemplate(user.name,user.email,user.resetPasswordOTP,user.resetPasswordExpires,);
        await emailSend(user.email, template, "Confirm Your Email");
        await user.save();
    }
    apiResponse.sendSuccess(res, 201, "your otp send successful check your email")
});

// forget Password
exports.forgetPassword = asyncHandler(async (req ,res) => {
    const {email} = req.body;
    if(!email) throw new CustomError(401 , "email missing");
    const user = await userModel.findOne({email})
    if(!user) throw new CustomError(401 , "user not found you need to register first");
    return res.status(301).redirect('https://github.com/Afridul369/nodeBackend/blob/main/src/controller/user.controller.js')
});

// reset password
exports.resetPassword = asyncHandler(async (req ,res ) => {
    const {email , newPassword , confirmPassword} = req.body
    let pattern = new RegExp("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$");
    if(!newPassword & !confirmPassword) throw new CustomError(401, "password is missing");
    if(!pattern.test(newPassword)) throw new CustomError(401 ,"Password must include at least one uppercase letter, one lowercase letter, one number, and one special character");
    if(newPassword !== confirmPassword) throw new CustomError(401 , "password not match");
    const user = await userModel.findOne({email})
    if(!user) throw new CustomError(401 , "user not found you");
    user.password = newPassword;
    await user.save();
    return res.status(302).redirect('www.front.com/login');
})
