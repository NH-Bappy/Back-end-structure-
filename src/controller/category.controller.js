const categoryModel = require('../models/category.model');
const {validateCategory} = require('../validation/category.validation');
const {asyncHandler} = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { uploadFileInCloudinary, removeCloudinaryFile } = require('../helpers/cloudinary');
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
});

// show all the category
exports.findAllCategories = asyncHandler(async (req , res) => {
    const category = await categoryModel.find().sort({createdAt: -1});
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
exports.removeCategory = asyncHandler(async (req ,res) => {
    const {slug} = req.params;
    if(!slug) throw new CustomError(401 , "slug is missing");
    const category = await categoryModel.findOne({slug});
    if(!category) throw new CustomError(500 , "category not found");
    if(req?.files?.image){
        const splitLink = category.image.split('/');
        const lastPart = splitLink[splitLink.length -1]
        const removeImage = await removeCloudinaryFile(lastPart.split('?')[0]);
        if(removeImage !== "ok") throw new CustomError(401 , "image not deleted");
    }
    const removeCategory =await categoryModel.findOneAndDelete({slug})
    apiResponse.sendSuccess(res , 200 , "category remove successfully" , removeCategory)
})