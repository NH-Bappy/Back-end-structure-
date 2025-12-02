const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require('jsonwebtoken');
const { CustomError } = require("../utils/customError");
const userModel = require('../models/user.model');

exports.authGuard = asyncHandler(async (req, res, next) => {

    if (!req.headers.authorization) {
        throw new CustomError(401, "Authorization header missing");
    }

    const rawHeader = req.headers.authorization;
    // console.log("RAW HEADER:", rawHeader);

    const accessToken = rawHeader.replace("Bearer ", "");
    // console.log("TOKEN:", accessToken);

    let tokenObject;

    try {
        tokenObject = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new CustomError(401, "Token is invalid or expired");
    }

    const userProfile = await userModel.findById(tokenObject.userId);

    if (!userProfile) {
        throw new CustomError(401, "User not found");
    }

    // console.log("USER PROFILE:", userProfile);

    req.user = userProfile;

    next();
});
