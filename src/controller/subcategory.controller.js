const subCategoryModel = require("../models/subCategory.model");
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../utils/customError");
const { validateSubcategory } = require("../validation/subCategory.validation");




//@desc create subcategory
exports.createNewSubCategory = asyncHandler(async (req ,res) => {
    const value = await validateSubcategory(req);
    // console.log(value);
    const subcategory = await subCategoryModel.create(value);
    if (!subcategory) throw new CustomError(401 , "please try again creating subcategory");
    apiResponse.sendSuccess(res , 200 , "Successfully created a new subcategory", subcategory);
});

//@desc show all the category
exports.findAllSubcategories = asyncHandler(async(req ,res) => {
    const allSubcategory = await subCategoryModel.find().populate("category").sort({createdAt: -1})
    if(!allSubcategory) throw new CustomError(401 , "subcategory not found");
    apiResponse.sendSuccess(res , 200 ,"successfully found all the subcategory" , allSubcategory);
});

//@desc find a specific category using slug
exports.getSubcategoryBySlug = asyncHandler(async(req ,res) => {
    const {slug} = req.params;
    if(!slug) throw new CustomError(401 , " The slug does not match");
    const specificSubcategory = await subCategoryModel.findOne({slug}).populate("category");
    if(!specificSubcategory) throw new CustomError(401 , "Requested subcategory not found");
    apiResponse.sendSuccess(res , 200 , "Requested subcategory found successfully" , specificSubcategory);
});