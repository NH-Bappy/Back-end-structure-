const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require('jsonwebtoken');
const { CustomError } = require("../utils/customError");
const userModel = require('../models/user.model');

exports.authGuard = asyncHandler(async (req , res ,next ) => {
    // console.log(req.headers.authorization)
    const accessToken = req?.headers?.authorization?.replace("Bearer " , "");
    // console.log(accessToken)
    const tokenObject = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // console.log(tokenObject)
    if(!tokenObject) throw new CustomError(401 , "Token is invalid/expired");
    const userProfile = await userModel.findById(tokenObject.userId);
    if (!userProfile) throw new CustomError(401, "You are not logged in !!");
    console.log(userProfile);
    req.user = userProfile;
    next()
});