const subCategoryModel = require("../models/subCategory.model");
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../utils/customError");
const { validateSubcategory } = require("../validation/subCategory.validation");




//desc create subcategory
exports.createNewSubCategory = asyncHandler(async (req ,res) => {
    const value = await validateSubcategory(req);
    // console.log(value);
    const subcategory = await subCategoryModel.create(value);
    if (!subcategory) throw new CustomError(401 , "please try again creating subcategory");
    apiResponse.sendSuccess(res , 200 , "Successfully created a new subcategory", subcategory);
})