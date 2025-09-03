const Joi = require('joi');
const { CustomError } = require('../utils/customError');


const userValidationSchema = Joi.object({
    email: Joi.string()
        .trim()
        .required()
        .pattern(/^([\w-\.]+)@([\w-]+\.)+[\w-]{2,4}?$/)
        .messages({
            "string.empty": "Email is required",
            "string.pattern.base": "Please enter a valid email address",
            "any.required": "Email field cannot be left blank"
        }),

    password: Joi.string()
        .trim() 
        .required()
        // .min(8) // minimum 8 characters
        // .max(30) // maximum 30 characters
        .pattern(new RegExp("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$"))
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password must not be longer than 30 characters",
            "string.pattern.base": "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
            "any.required": "Password field cannot be left blank"
        }),

    phoneNumber: Joi.string()
        .trim()
        // .required()
        .pattern(/^(?:\+88|01)?\d{11}$/)
        .messages({
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be a valid Bangladeshi number (e.g. +8801XXXXXXXXX or 01XXXXXXXXX)",
            "any.required": "Phone number field cannot be left blank"
        }),

}).unknown(true);


exports.validateUser = async (req) => {
    try {
        const value = await userValidationSchema.validateAsync(req.body) //validateAsync checks if the data follows the schema rules (e.g., required fields, email format, password length, etc.).
        return value
    } catch (error) {
        console.log("error from validate method", error);
        throw new CustomError(401, error.details[0].message) //error.details[0].message [is the human-readable message from Joi (e.g., "Email is required").]
    }
}