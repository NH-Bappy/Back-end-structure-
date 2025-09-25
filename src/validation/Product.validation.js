const Joi = require('joi');
const mongoose = require('mongoose');
const { CustomError } = require('../utils/customError');

// Helper: check if valid MongoDB ObjectId
const isValidObjectId = (value, helpers) => {
    if (value === null || value === "") return value; // allow null or empty string
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid"); // Return Joi error if invalid ObjectId
    }
    return value; // Otherwise return the value
};

// Joi validation schema for Product
const productValidationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        "string.length": "Invalid category ID.",
        "any.required": "Category is required.",
    }),
    description: Joi.string().allow("", null),
    category: Joi.string().hex().length(24).required().messages({
        "string.length": "Invalid category ID.",
        "any.required": "Category is required.",
    }),
    subCategory: Joi.custom(isValidObjectId).allow(null, ""),
    Brand: Joi.custom(isValidObjectId).allow(null, ""),
    variant: Joi.custom(isValidObjectId).allow(null, ""),
    discount: Joi.custom(isValidObjectId).allow(null, ""),
    manufactureCountry: Joi.string().allow("", null),
    rating: Joi.number().min(0).max(5).allow(null),
    warrantyInformation: Joi.string().allow("", null),
    warrantyClaim: Joi.boolean().default(true),
    warrantyExpires: Joi.date().allow(null),
    availabilityStatus: Joi.string().valid(
        "In Stock",
        "Out of Stock",
        "PreOrder"
    ),
    sku: Joi.string().required().messages({
        "string.empty": "SKU is required.",
    }),
    QrCode: Joi.string().allow("", null),
    barCode: Joi.string().allow("", null),
    groupUnit: Joi.string().valid("Box", "Packet", "Dozen", "Custom"),
    groupUnitQuantity: Joi.number().allow(null).optional(),
    unit: Joi.string()
        .valid("Piece", "Kg", "Gram", "Packet", "Custom")
        .required(),
    variantType: Joi.string()
        .valid("singleVariant", "multipleVariant")
        .required(),
    size: Joi.string().allow("", null),
    color: Joi.string().allow("", null),
    stock: Joi.number().allow(null),
    warehouseLocation: Joi.custom(isValidObjectId).allow(null, ""),
    retailPrice: Joi.number().messages({
        "number.base": "Retail price must be a number.",
        "any.required": "Retail price is required.",
    }),
    retailPriceProfitAmount: Joi.number().allow(null),
    retailPriceProfitPercentage: Joi.number().max(100).allow(null),
    wholesalePrice: Joi.number().messages({
        "number.base": "Wholesale price must be a number.",
        "any.required": "Wholesale price is required.",
    }),
    alertQuantity: Joi.number().allow(null),
    stockAlert: Joi.boolean().allow(null),
    inStock: Joi.boolean().allow(null),
    isActive: Joi.boolean().allow(null),
    minimumOrderQuantity: Joi.number().allow(null),
    tag: Joi.array().items(Joi.string()).allow(null),
    reviews: Joi.array().items(Joi.custom(isValidObjectId)).allow(null),
},
    {
        allowUnknown: true,
    }
);

// Product Validation Function
exports.validateProduct = async (req) => {
    try {
        const data = await productValidationSchema.validateAsync(req.body);

        // Validate image files
        const acceptTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

        if (!req?.files?.image || req.files.image.length === 0) {
            throw new CustomError(400, "At least one product image is required.");
        }

        // mimetype + size check
        for (const oneImage of req.files.image) {
            if (!acceptTypes.includes(oneImage.mimetype)) {
                throw new CustomError(
                    400,
                    `Image type '${oneImage.mimetype}' is not allowed.`
                );
            }
            if (oneImage.size > 5 * 1024 * 1024) {
                throw new CustomError(400, "Each image must be under 5MB.");
            }
        }

        return {
            ...data,
            image: req.files.image, // returning full image array
        }

    } catch (error) {
        console.log("Error from validateProduct method:", error.details ? error.details[0].message : error.message);
        throw new CustomError(
            401,
            error.details ? error.details[0].message : error.message
        )
    }
}
