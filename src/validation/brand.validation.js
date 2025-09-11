const joi = require('joi');
const { CustomError } = require('../utils/customError');


// brand validation Schema
const brandValidationSchema = joi.object({
    name: joi.string().trim().required().messages({
        "string.empty": "Brand name cannot be empty.",
        "any.required": "Brand name is required.", 
    }),
    since: joi.number().required().messages({
        "number.base": "Since must be a number.",
        "any.required": "Since is required.",
    }),
    isActive: joi.boolean().default(true)
},
    { allowUnknown: true }
);

//export validation function

exports.validateBrandRequest = async (req) => {
    try {
        // Validate category name from request body using Joi schema
        const value = await brandValidationSchema.validateAsync(req.body);

        // Ensure an image was uploaded
        if (!req.files || !req.files.image || req.files.image.length === 0) {
            throw new CustomError(400, "Image is required")
        };

        // Accept only specific mime types
        const allowImageType = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
        //Here, includes() checks if the uploaded file’s MIME type exists inside the allowedImageTypes array
        if (!allowImageType.includes(req.files.image[0].mimetype)) {
            throw new CustomError(401, "The image must be PNG, JPG, JPEG, or WEBP")
        };

        // Restrict image size (e.g. max ~5MB = 5 * 1024 * 1024)
        if (req.files.image[0].size > 5 * 1024 * 1024) {
            throw new CustomError(401, "We only accept images smaller than 5MB");
        };

        // Return validated values (category name + image info)
        return {
            name: value.name,
            since: value.since,
            isActive: value.isActive,
            image: req.files.image[0],
        }

    } catch (error) {
        console.log("error from validation brand method:", error);
        throw new CustomError(401, error.details ? error.details[0].message : error.message);
    }
};
