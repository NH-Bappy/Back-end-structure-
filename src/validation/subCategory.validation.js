const Joi = require("joi");                                 // Import Joi for validation
const mongoose = require("mongoose");
const { CustomError } = require("../utils/customError");



// helper: check if valid MongoDB ObjectId
// helpers → a Joi utility object that helps you return custom validation errors.
/*mongoose.Types.ObjectId.isValid(value) is a built-in Mongoose method.
It checks whether the given value is a valid MongoDB ObjectId (24-character hex string).
*/
const isValidObjectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");                 // Return Joi error if invalid ObjectId
    }
    return value;                                            // Otherwise return the value
};

// Joi validation schema for subCategory
const subCategoryValidationSchema = Joi.object({
    name: Joi.string().trim().required().messages({          // Validate name field
        "string.empty": "SubCategory name cannot be empty.",
        "any.required": "SubCategory name is required.",
    }),
    category: Joi.string().custom(isValidObjectId).required().messages({ // Validate category ID
        "any.invalid": "Category ID is not valid.",
        "any.required": "Category ID is required.",
    }),
    isActive: Joi.boolean().default(true),                   // Optional: defaults to true
}, {
    allowUnknown: true,                                      // Ignore unknown fields in request body
});

// Validator function
exports.validateSubcategory = async (req) => {
    try {
        // validateAsync checks if req.body follows schema rules
        const value = await subCategoryValidationSchema.validateAsync(req.body);
        return value;
    } catch (error) {
        console.log("Error from validateSubcategory method:", error);
        // Throw custom error with Joi's first validation message
        throw new CustomError(401, error.details[0].message);
    }
};
