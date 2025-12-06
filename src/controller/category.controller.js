const categoryModel = require('../models/category.model');
const {validateCategory} = require('../validation/category.validation');
const {asyncHandler} = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { uploadFileInCloudinary, removeCloudinaryFile } = require('../helpers/cloudinary');
const { apiResponse } = require('../utils/apiResponse');
const fs = require("fs");

exports.newCategory = asyncHandler(async (req, res) => {
    const value = await validateCategory(req);
    // console.log(value)

    // Creates a new document in MongoDB using your categoryModel, with the given name and image
    // Create and save a new category.
    // Image is set to null for now — we will upload it later in the background.
    const category = await categoryModel.create({
        name: value.name,
        image: null
    });
    // Because of the await, it waits until MongoDB finishes saving and then stores the created document in the category variable.
    if (!category) throw new CustomError(500, "Something went wrong, please try again");
    apiResponse.sendSuccess(res, 201, "Category created successfully", category);

    // Background Task (Non-blocking)
    // This IIFE runs asynchronously AFTER the response is sent.
    // Useful because Cloudinary uploads take time.
    (async () => {
        try {
            // Check if image file exists before uploading
            if (value?.image?.path) {
                // Upload image to Cloudinary.
                // Returns the public URL of the uploaded file.
                const imageUrl = await uploadFileInCloudinary(value.image.path);

                // Update the category's image field with the Cloudinary URL
                await categoryModel.findOneAndUpdate(
                    { _id: category._id },
                    { image: imageUrl },
                    { new: true }
                );
                // console.log("Category image successfully uploaded in background.");

                // Delete temporary local file after Cloudinary upload
                if (fs.existsSync(value.image.path)) {
                    fs.unlink(value.image.path, (err) => {
                        if (err) console.log("Delete failed:", err);
                    });
                } else {
                    // console.log("Temp file already gone:", value.image.path);
                }

            }
        } catch (error) {
            // Error handling for background processing (does NOT affect user response)
            console.log("Category image upload failed", error);
        }
    })();
});






// show all the category
exports.findAllCategories = asyncHandler(async (req , res) => {
    const category = await categoryModel.find().populate("subCategory discount").sort({createdAt: -1});
    if(!category) throw new CustomError(401, "category not found");
    apiResponse.sendSuccess(res , 200 , "successfully found the category" , category);
});

// find a specific category using slug
exports.getCategoryBySlug = asyncHandler(async (req ,res) => {
    const {slug} = req.params;
    const category = await categoryModel.findOne({slug});
    if(!category) throw new CustomError(401 ,"Requested category does not exist.");
    apiResponse.sendSuccess(res ,200 , "category found successfully" , category)
});

// update category

exports.modifyCategory = asyncHandler(async (req , res) => {
    const {slug} = req.params;
    const category = await categoryModel.findOne({slug});
    if(!category) throw new CustomError(401 ,"Requested category does not exist.");
    if(req?.body?.name) {category.name = req?.body?.name};
    if(req?.files?.image) {
        // console.log(category.image.split('/'))
        const parts = category.image.split('/');
        // console.log(parts);
        const publicId = parts[parts.length -1]
        // console.log(publicId);
        // console.log(publicId.split("?")[0]);
        const result = await removeCloudinaryFile(publicId.split("?")[0]);
        if(result !== "ok") throw new CustomError(401 , "image not deleted")
        const imageUrl = await uploadFileInCloudinary(req?.files?.image[0]?.path);
        category.image = imageUrl
    };
    await category.save()
    apiResponse.sendSuccess(res , 200 ,"category update successfully" ,category)
});


// delete category from data base
exports.removeCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(401, "slug is missing");

    // Find category
    const category = await categoryModel.findOne({ slug });
    if (!category) throw new CustomError(404, "category not found");

    // Extract image ID
    let imageId = null;
    if (category.image) {
        const splitLink = category.image.split("/");
        const lastPart = splitLink[splitLink.length - 1];
        imageId = lastPart.split("?")[0];
    }

    //Delete category immediately (fast) fro faster response time
    const removed = await categoryModel.findOneAndDelete({ slug });

    // Send response instantly
    apiResponse.sendSuccess(res, 200, "category removed successfully", removed);

    // Delete image in background (does NOT slow response)
    if (imageId) {
        removeCloudinaryFile(imageId)
            .then((resp) => console.log("Background image deleted:", resp))
            .catch((err) => console.log("Failed to delete image:", err));
    }
});
