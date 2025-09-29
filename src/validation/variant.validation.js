const Joi = require("joi");
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
    return value;
};

const variantValidationSchema = Joi.object({
    product: Joi.string().custom(isValidObjectId).required().messages({
        "any.required": "Product ID is required.",
        "any.invalid": "Please provide a valid Product ID.",
    }),
    name: Joi.string().trim().required().messages({
        "string.empty": "Variant name cannot be empty.",
        "any.required": "Variant name is required.",
    }),
    description: Joi.string().trim().allow("", null),
    size: Joi.string().default("N/A"),
    color: Joi.string(),
    stockVariant: Joi.number().min(0).required().messages({
        "number.base": "Stock must be a number.",
        "any.required": "Stock is required.",
    }),
    alertVariantStock: Joi.number().min(0).default(5),
    retailPrice: Joi.number().min(0).required().messages({
        "any.required": "Retail price is required.",
    }),
    wholesalePrice: Joi.number().min(0).required().messages({
        "any.required": "Wholesale price is required.",
    }),
    isActive: Joi.boolean().default(true),
},
    {
        allowUnknown: true,
    }
);



exports.validateVariant = async (req) => {
    try {
        // Validate body with Joi schema
        const data = await variantValidationSchema.validateAsync(req.body);

        const acceptedMimeTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
        ];

        const maxFileSize = 15 * 1024 * 1024; // 15MB
        const maxFileCount = 5; // Limit to 5 files

        const files = req?.files?.image;

        if (!files || files.length === 0) {
            throw new CustomError(400, "At least one image must be uploaded.");
        }

        if (files.length > maxFileCount) {
            throw new CustomError(400, `You can upload a maximum of ${maxFileCount} images.`);
        }

        for (const file of files) {
            if (!acceptedMimeTypes.includes(file.mimetype)) {
                throw new CustomError(400, `Invalid image format: ${file.originalname}`);
            }


            if (file.size > maxFileSize) {
                throw new CustomError(400,`Image is too large: ${file.originalname} (Maximum allowed is 15MB)`);
            }
        }

        // All good: return validated data
        return { ...data, images: files };
    } catch (error) {
        console.error("Variant Validation Error:", error);
        throw new CustomError(401, error.details?.[0]?.message || error.message);
    }
}

