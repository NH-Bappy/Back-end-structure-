const { uploadFileInCloudinary, removeCloudinaryFile } = require('../helpers/cloudinary');
const brandModel = require('../models/brand.model');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { validateBrandRequest } = require('../validation/brand.validation');


//@desc new brand create
exports.registerBrand = asyncHandler(async (req, res) => {
    const value = await validateBrandRequest(req)
    // console.log(value);
    //@That line uploads the image file to Cloudinary and returns its hosted URL, so you can save the URL in your database instead of storing the file locally.
    const uploadImageUrl = await uploadFileInCloudinary(value?.image?.path);
    if (!uploadImageUrl) throw new CustomError(500, "your URL is missing or some wrong with your image or database");
    // Creates a new document in MongoDB using your brandModel, with the given value and image
    const brand = await brandModel.create({ ...value, image: uploadImageUrl, })
    if (!brand) throw new CustomError(401, "brand not created");
    apiResponse.sendSuccess(res, 200, "brand created successfully", brand);
});

//@desc find all brand 
exports.findAllBrand = asyncHandler(async (req, res) => {
    const brand = await brandModel.find({}).sort({ createdAt: -1 });
    if (!brand) throw new CustomError(401, "all brand are not found");
    apiResponse.sendSuccess(res, 200, "find all brand successfully", brand);
});

//@desc find a specific brand using slug
exports.getBrandBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(401, " The slug does not match");
    const brand = await brandModel.findOne({ slug });
    if (!brand) throw new CustomError(401, "Requested brand does not exist.");
    apiResponse.sendSuccess(res, 200, "Requested brand found successfully", brand);
});

//@desc update category
exports.modifyCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(401, " The slug does not match");
    const brandFormMongodb = await brandModel.findOne({ slug });
    console.log(brandFormMongodb);

    if (!brandFormMongodb) throw new CustomError(401, "Requested brand does not exist.");
    // console.log(brandFormMongodb);
    if (req?.body?.name) { brandFormMongodb.name = req?.body?.name };
    if (req?.files?.image) {
        // upload image
        // console.log(req?.files?.image)
        const parts = brandFormMongodb.image.split('/');
        // console.log(parts);
        const publicId = parts[parts.length - 1];
        // console.log(publicId);
        // console.log(publicId.split("?")[0]);
        const result = await removeCloudinaryFile(publicId.split("?")[0]);
        if (result !== "ok") throw new CustomError(401, "image not deleted")
        const uploadImage = await uploadFileInCloudinary(req?.files?.image[0].path)
        brandFormMongodb.image = uploadImage;
    };
    await brandFormMongodb.save()
    apiResponse.sendSuccess(res, 200, "brand update successfully", brandFormMongodb);
});

//@desc delete category from data base

exports.removeBrand = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    if (!slug) throw new CustomError(401, "The slug does not match");

    const brand = await brandModel.findOne({ slug });
    if (!brand) throw new CustomError(404, "Brand data not found");

    // Try deleting image if it exists
    if (brand.image) {
        try {
            const url = brand.image;
            const filename = url.split("/").pop();
            const cleanFilename = filename.split("?")[0];
            const publicId = cleanFilename.split(".")[0];
            await removeCloudinaryFile(publicId);
        } catch (error) {
            console.warn("Cloudinary delete failed but brand will still be removed:", error.message);
        }
    }
    // ALWAYS DELETE BRAND (whether image deleted or not)
    const removedBrand = await brandModel.findOneAndDelete({ slug });
    apiResponse.sendSuccess(res, 200, "Brand removed successfully", removedBrand);
});
