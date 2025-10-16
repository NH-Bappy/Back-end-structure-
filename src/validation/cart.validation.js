const Joi = require('joi');
const mongoose = require('mongoose');
const { CustomError } = require('../utils/customError');

// Helper function: Validate MongoDB ObjectId
const isValidObjectId = (value, helpers) => {
    if (value === null) return value;
    if (value === undefined) return helpers.error("any.invalid");
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
    }
    return value;
};

// Cart validation schema
const cartSchemaValidation = Joi.object({
    user: Joi.string()
        .custom(isValidObjectId)
        .allow(null, "")
        .optional()
        .messages({
            "any.invalid": "User ID must be a valid ObjectId.",
        }),

    guestID: Joi.string().optional().allow(null, "").messages({
        "string.base": "Guest ID must be a string.",
    }),

    productID: Joi.string()
        .custom(isValidObjectId)
        .allow(null, "")
        .messages({
            "any.invalid": "Product ID must be a valid ObjectId.",
        }),

    variantID: Joi.string()
        .custom(isValidObjectId)
        .allow(null, "")
        .messages({
            "any.invalid": "Variant ID must be a valid ObjectId.",
        }),

    color: Joi.string().trim().required().messages({
        "string.empty": "Color is required.",
        "any.required": "Color is required.",
    }),

    size: Joi.string().trim().required().messages({
        "string.empty": "Size is required.",
        "any.required": "Size is required.",
    }),

    quantity: Joi.number().integer().min(1).required().messages({
        "number.base": "Quantity must be a number.",
        "number.min": "Quantity must be at least 1.",
        "any.required": "Quantity is required.",
    }),

    coupon: Joi.string()
        .custom(isValidObjectId)
        .allow(null, "")
        .messages({
            "any.invalid": "Coupon ID must be a valid ObjectId.",
        }),
},
    { allowUnknown: true });

// Export validation function
exports.cartValidation = async (req) => {
    try {
        const validated = await cartSchemaValidation.validateAsync(req.body);
        return validated;
    } catch (error) {
        console.log("Error from validateCartItemAction:", error);
        throw new CustomError(400, error?.details?.[0]?.message || error.message);
    }
};
