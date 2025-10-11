// Import required modules
const Joi = require('joi');
const mongoose = require('mongoose');
const { CustomError } = require('../utils/customError');


// Helper function: Validate MongoDB ObjectId
// -----------------------------------------------------
// Used by Joi's `.custom()` validator to check if a value
// is a valid ObjectId. Allows null values where applicable.
const isValidateObject = (value, helpers) => {
    // Allow explicit null (for optional product/variant fields)
    if (value === null) return value;

    // Disallow empty strings or undefined values
    if (value === '' || value === undefined) {
        return helpers.error("any.invalid");
    }

    // If not a valid MongoDB ObjectId, return an error
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
    }

    // If all checks pass, return the value
    return value;
};

const reviewValidationSchema = Joi.object({
    // Reviewer must be a valid ObjectId and required
    reviewer: Joi.string()
        .custom(isValidateObject)
        .required()
        .messages({
            "any.invalid": "Reviewer ID must be a valid ObjectId.",
            "any.required": "Reviewer ID is required.",
        }),

    // Comment must be a non-empty string
    comment: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Comment cannot be empty.",
            "any.required": "Comment is required.",
        }),

    // Rating must be a number between 1 and 5
    rating: Joi.number()
        .min(1)
        .max(5)
        .required()
        .messages({
            "number.base": "Rating must be a number.",
            "number.min": "Rating must be at least 1.",
            "number.max": "Rating cannot be more than 5.",
            "any.required": "Rating is required.",
        }),

    // Product ID is optional but must be a valid ObjectId or null
    product: Joi.string()
        .custom(isValidateObject)
        .allow(null)
        .optional()
        .messages({
            "any.invalid": "Product ID must be a valid ObjectId or null.",
        }),

    // Variant ID is optional but must be a valid ObjectId or null
    variant: Joi.string()
        .custom(isValidateObject)
        .allow(null)
        .optional()
        .messages({
            "any.invalid": "Variant ID must be a valid ObjectId or null.",
        }),
}).custom((value, helpers) => {
    // Custom cross-field rule
    // Ensures that at least one of 'product' or 'variant' is provided.
    if (!value.product && !value.variant) {
        return helpers.message("Either product or variant must be provided.");
    }
    return value;
});


// Exported validation function
// -----------------------------------------------------
// Call this function inside your controller before saving a review.
// Example usage:
//   const data = await validateReview(req);
exports.validateReview = async (req) => {
    try {
        // Validate request body against schema
        // `abortEarly: false` → returns all validation errors instead of stopping at the first
        const value = await reviewValidationSchema.validateAsync(req.body, { abortEarly: false });

        // If validation passes, return the sanitized value
        return value;
    } catch (error) {
        // Log error for debugging (optional)
        console.log("Error from validateReview:", error);

        // Throw a custom error for your global error handler
        throw new CustomError(
            400,
            error.details ? error.details[0].message : error.message
        );
    }
};
