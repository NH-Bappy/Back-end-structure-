const categoryModel = require('../models/category.model');
const {validateCategory} = require('../validation/category.validation');
const {asyncHandler} = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { uploadFileInCloudinary } = require('../helpers/cloudinary');
const { apiResponse } = require('../utils/apiResponse');


exports.newCategory = asyncHandler(async (req,res) => {
    const value = await validateCategory(req);
    // console.log(value)
    const imageUrl = await uploadFileInCloudinary(value?.image?.path);
    const category = await new categoryModel({
        name:value.name,
        image:imageUrl
    }).save()
    if(!category) throw new CustomError(401 , "some thing wrong please try again");
    apiResponse.sendSuccess(res , 201 ,"category created successfully" , category)
})