const { uploadFileInCloudinary } = require('../helpers/cloudinary');
const brandModel = require('../models/brand.model');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { validateBrandRequest } = require('../validation/brand.validation');


//@desc new brand create
exports.registerBrand = asyncHandler(async (req ,res) => {
    const value = await validateBrandRequest(req)
    // console.log(value);
//@//@That line uploads the image file to Cloudinary and returns its hosted URL, so you can save the URL in your database instead of storing the file locally.
    const uploadImageUrl = await uploadFileInCloudinary(value?.image?.path);
    if(!uploadImageUrl) throw new CustomError(500 , "your URL is missing or some wrong with your image or database");
// Creates a new document in MongoDB using your brandModel, with the given value and image
    const brand = await brandModel.create({...value , image:uploadImageUrl,})
    if(!brand) throw new CustomError(501 , "some wrong with your give data brand not created");
    apiResponse.sendSuccess(res , 200 , "brand created successfully" , brand);
});

//@ find all brand 
exports.findAllBrand = asyncHandler(async(req ,res ) => {
    const brand = await brandModel.find({}).sort({createdAt: -1});
    if (!brand) throw new CustomError(401 , "all brand are not found");
    apiResponse.sendSuccess(res , 200 , "find all brand successfully" , brand);
})