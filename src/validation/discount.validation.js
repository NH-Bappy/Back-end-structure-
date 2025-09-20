const Joi = require("joi"); // Import Joi for validation
const mongoose = require("mongoose");
const { CustomError } = require("../utils/customError");

// Helper: check if valid MongoDB ObjectId
const isValidObjectId = (value, helpers) => {
    if (value === null) return value; // allow null explicitly
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid"); // Return Joi error if invalid ObjectId
    }
    return value; // Otherwise return the value
};

// Joi validation schema for discount
const discountValidationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        "string.empty": "Discount name cannot be empty.",
        "any.required": "Discount name is required.",
    }),

    discountValueByAmount: Joi.number().optional().min(0).messages({
        "number.base": "Discount value by amount must be a number",
        "number.min": "Discount value by amount cannot be negative",
    }),

    discountValueByPercentage: Joi.number().optional().min(0).max(100).messages({
        "number.base": "Discount value by percentage must be a number.",
        "number.min": "Discount percentage cannot be negative.",
        "number.max": "Discount percentage cannot be greater than 100.",
    }),

    discountType: Joi.string().valid("tk", "percentage").required().messages({
        "any.only": "Discount type must be either 'tk' or 'percentage'.",
        "any.required": "Discount type is required.",
    }),

    discountPlan: Joi.string()
        .valid("flat", "category", "product", "subcategory")
        .required()
        .messages({
            "any.only":
                "Discount plan must be either 'flat', 'category', 'product' or 'subcategory'.",
            "any.required": "Discount plan is required.",
        }),

    discountValidFrom: Joi.date().required().messages({
        "date.base": "Discount valid from must be a valid date.",
        "any.required": "Discount valid from date is required.",
    }),

    discountValidTo: Joi.date()
        .greater(Joi.ref("discountValidFrom"))
        .required()
        .messages({
            "date.base": "Discount valid to must be a valid date.",
            "date.greater":
                "Discount valid to date must be after discount valid from date.",
            "any.required": "Discount valid to date is required.",
        }),

    targetProduct: Joi.string()
        .optional()
        .allow(null)
        .custom(isValidObjectId)
        .messages({
            "any.invalid": "Target product ID is not valid.",
        }),

    targetCategory: Joi.string()
        .optional()
        .allow(null)
        .custom(isValidObjectId)
        .messages({
            "any.invalid": "Target category ID is not valid.",
        }),

    targetSubcategory: Joi.string()
        .optional()
        .allow(null)
        .custom(isValidObjectId)
        .messages({
            "any.invalid": "Target subcategory ID is not valid.",
        }),

    isActive: Joi.boolean().optional().default(true),
}, // allow extra fields
{ allowUnknown: true })//.xor("discountValueByAmount", "discountValueByPercentage");// Rule: Either discountValueByAmount OR discountValueByPercentage



// Export validation function
exports.validateDiscount = (req) => {
    const { error, value } = discountValidationSchema.validate(req.body, { //validate(data, options) → this method checks if the provided data (in your case req.body) follows the schema rules.
        abortEarly: true, // stop at first error It controls whether Joi should stop at the first error it finds, or collect all errors.
    });
    if (error) {
        console.log("Validation error:", error.details[0].message);
        throw new CustomError(401, error.details[0].message);
    }
    return value;
};
