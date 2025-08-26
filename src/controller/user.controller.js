const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { customError } = require("../utils/customError");

exports.registration = asyncHandler((req ,res) => {
    // console.log("he stop")
    // res.send("OK") 
    // apiResponse.sendSuccess(res , 201, "registrationSuccessful" , {data:'null'})
    throw new customError(404 , "email Missing")
})
