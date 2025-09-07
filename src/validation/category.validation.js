const joi = require('joi');
const { CustomError } = require('../utils/customError');

// category validation schema
const CategoryValidationSchema = joi.object({
    name : joi.string().trim().required().messages({
        "string.empty": "this field is empty",   // when the string is empty
        "any.required" : "the category name is necessary" // when name is missing
    }),
}, {
    allowUnknown:true // allow extra fields in the body
})

// export validation function
exports.validateCategory = async (req) => {
  try {
    // Validate category name from request body using Joi schema
    const value = await CategoryValidationSchema.validateAsync(req.body);

    // Ensure an image was uploaded
    if (!req.files || !req.files.image || req.files.image.length === 0) {
      throw new CustomError(400, "Image is required");
    }

    const uploadedImage = req.files.image[0]; // the uploaded file

    // Accept only specific mime types
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(uploadedImage.mimetype)) {
      throw new CustomError(401, "The image must be PNG, JPG, JPEG, or WEBP");
    }

    // Restrict image size (e.g. max ~5MB = 5 * 1024 * 1024)
    if (uploadedImage.size > 5 * 1024 * 1024) {
      throw new CustomError(401, "We only accept images smaller than 5MB");
    }

    // Return validated values (category name + image info)
    return {
      name: value.name,
      image: uploadedImage
    };

  } catch (error) {
    console.log("error from validation category method:", error);

    // Joi validation errors have `error.details`, others don’t
    if (error.details && error.details[0]) {
      throw new CustomError(401, error.details[0].message);
    }

    // rethrow other errors
    throw error;
  }
};

