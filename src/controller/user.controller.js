require('dotenv').config();
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../utils/customError");
const userModel = require('../models/user.model');
const { validateUser } = require("../validation/user.validation");
const { registrationTemplate, resendOtpTemplate } = require("../template/emailTemplate");
const { Otp, emailSend } = require('../helpers/helper');
const jwt = require('jsonwebtoken');



// user registration
exports.registration = asyncHandler(async (req, res) => {
    // console.log("he stop")
    // res.send("OK") 

    // apiResponse.sendSuccess(res , 201, "registrationSuccessful" , {data:'null'})
    // throw new customError(404 , "email Missing")

    // const {email , password} = req.body;
    // console.log(email , password)

    // console.log(Otp())

    // ⬇️ Validate user input
    const value = await validateUser(req)
    // console.log(value)


    // ⬇️ Check duplicate email before creating user
    const isExist = await userModel.findOne({ email: value.email });
    if (isExist) {
        throw new CustomError(409, "email already exists");
    }


    // ⬇️ Now save the user into database
    const user = await new userModel({
        name: value.name, // this from user schema and i get this value from postman (e.g name , email ,password)
        email: value.email || null,
        password: value.password,
    }).save()

    if (!user) {
        throw new CustomError(501, "user is not registered server error")
    }

    // send confirm registration mail
    const verifyEmailLink = `www.frontend.com/verifyEmail${user.email}`

    user.resetPasswordOTP = Otp();
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    const template = registrationTemplate(
        user.name,
        user.email,
        user.resetPasswordOTP,
        user.resetPasswordExpires,
        verifyEmailLink
    );

    // send email
    // const result = await emailSend(user.email, template, "Confirm Your Email");

    // if (!result) {
    //     throw new CustomError(501, 'email send fail')
    // }

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
        const template = resendOtpTemplate(user.name, user.email, user.resetPasswordOTP, user.resetPasswordExpires,);
        await emailSend(user.email, template, "Confirm Your Email");
        await user.save();
    }
    apiResponse.sendSuccess(res, 201, "your otp send successful check your email")
});

// forget Password
exports.forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new CustomError(401, "email missing");
    const user = await userModel.findOne({ email })
    if (!user) throw new CustomError(401, "user not found you need to register first");
    return res.status(301).redirect('https://github.com/Afridul369/nodeBackend/blob/main/src/controller/user.controller.js')
});

// reset password
exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body
    let pattern = new RegExp("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$");
    if (!newPassword & !confirmPassword) throw new CustomError(401, "password is missing");
    if (!pattern.test(newPassword)) throw new CustomError(401, "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character");
    if (newPassword !== confirmPassword) throw new CustomError(401, "password not match");
    const user = await userModel.findOne({ email })
    if (!user) throw new CustomError(401, "user not found you");
    user.password = newPassword;
    await user.save();
    return res.status(302).redirect('www.front.com/login');
})

// login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (email == undefined) throw new CustomError(401, "email is missing");
    // search database 
    const user = await userModel.findOne({ email });
    if (!user) throw new CustomError(401, "user not found");

    // console.log(user)

    // password is right or not
    const checkPassword = await user.comparePassword(password);
    if (!checkPassword) throw new CustomError(401, "your password or email in incorrect");

    // generate access token and refresh token
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToke();

    //This cookie will store your refreshToken on the client’s browser

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, //The cookie cannot be accessed via JavaScript (document.cookie) on the client side.
        secure: process.env.NODE_ENV == "development" ? false : true,
        sameSite: "lax",// allows the cookie to be sent across different domains (important if your frontend and backend are on different domains).
        path: "/",
    })
    // refresh token save into database
    await user.updateOne({ refreshToken });
    apiResponse.sendSuccess(res, 200, "Login successful", {
        accessToken,
        userName: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
    });
})

// logout
exports.logout = asyncHandler(async (req, res) => {
    // Get token from request body or authorization header
    const token = req?.body?.token || req.headers?.authorization;

    // Verify token and extract userId (will throw error if token is invalid/expired)
    const { userId } = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user in the database by userId
    const user = await userModel.findById(userId);

    // Clear refreshToken cookie from client side
    res.clearCookie("refreshToken", {
        httpOnly: true, // prevents client-side JS access (XSS protection)
        secure: process.env.NODE_ENV == "development" ? false : true, // HTTPS only in production
        sameSite: "none", // allow cross-site requests (important for frontend-backend on different domains)
        path: "/", // cookie valid for entire domain
    });

    // Remove refreshToken from database (so token cannot be reused)
    user.refreshToken = null;
    await user.save();

    // Send success response
    apiResponse.sendSuccess(res, 201, "successfully logout", { user });
});


// send refreshToken token function
exports.refreshToken = asyncHandler(async(req ,res) => {
    const token = req.cookies;
    console.log(token);
});