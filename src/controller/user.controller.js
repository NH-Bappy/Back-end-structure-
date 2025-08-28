const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../utils/customError");
const userModel = require('../models/user.model');
const { validateUser } = require("../validation/user.validation");

exports.registration = asyncHandler( async(req ,res) => {
    // console.log("he stop")
    // res.send("OK") 

    // apiResponse.sendSuccess(res , 201, "registrationSuccessful" , {data:'null'})
    // throw new customError(404 , "email Missing")

    // const {email , password} = req.body;
    // console.log(email , password)

    const value = await validateUser(req)
    console.log(value)
})
