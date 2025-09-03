const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../utils/customError");
const userModel = require('../models/user.model');
const { validateUser } = require("../validation/user.validation");
const { registrationTemplate } = require("../template/emailTemplate");

exports.registration = asyncHandler( async(req ,res) => {
    // console.log("he stop")
    // res.send("OK") 

    // apiResponse.sendSuccess(res , 201, "registrationSuccessful" , {data:'null'})
    // throw new customError(404 , "email Missing")

    // const {email , password} = req.body;
    // console.log(email , password)

    const value = await validateUser(req)
    // console.log(value)


    //now save the user into database
    const user = await new userModel({
        name: value.name, // this from user schema and i get this value from postman (e.g name , email ,password)
        email: value.email,
        password: value.password
    }).save()

    if(!user){
        throw new CustomError(501, "user is not registered server error")
    }

    // send confirm registration mail
    const verifyEmail = `www.frontend.com/verifyEmail${user.email}`
    registrationTemplate(user.name ,user.email)
});
