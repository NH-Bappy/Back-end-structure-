const subCategoryModel = require("../models/subCategory.model");
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../utils/customError");
const { validateSubcategory } = require("../validation/subCategory.validation");
const categoryModel = require('../models/category.model'); 




//@desc create subcategory
exports.createNewSubCategory = asyncHandler(async (req, res) => {
    const value = await validateSubcategory(req);
    // console.log(value);

    // Create a new subcategory document in the database using the validated values
    const subcategoryObject = await subCategoryModel.create(value); // newly created subcategory object


    //is used to maintain the relationship between Category and Subcategory.
    // Update the parent category:
    // - Find the category by its _id (value.category comes from the request body)
    // - Push the new subcategory's _id into the category's subCategory array
    // - { new: true } ensures the updated category doc is returned (good practice)
    await categoryModel.findByIdAndUpdate(
        { _id: value.category },
        { $push: { subCategory: subcategoryObject._id } },
        { new: true }
    );

    if (!subcategoryObject) throw new CustomError(401, "please try again creating subcategory");

    apiResponse.sendSuccess(
        res,
        200,
        "Successfully created a new subcategory",
        subcategoryObject
    );
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

//@desc update subcategory
exports.modifyCategory = asyncHandler(async (req , res) => {
    const {slug} = req.params;
    if(!slug) throw new CustomError(401 , " Subcategory not found");
    const updateSubcategory = await subCategoryModel.findOneAndUpdate({slug}, {...req.body} , {new:true});
    if (!updateSubcategory) throw new CustomError(401 , "updateSubcategory is missing");
    apiResponse.sendSuccess(res , 200 , "update subcategory successfully" , updateSubcategory);
});


// @desc delete subcategory

exports. removeSubcategory = asyncHandler(async(req,res) => {
    const {slug} = req.params;
    if (!slug) throw new CustomError(400, "Slug is required");
    const removeSub = await subCategoryModel.findOneAndDelete({slug});
    // remove subcategory id from category model
    await categoryModel.findOneAndUpdate({_id:removeSub.category}, {$pull:{subCategory: removeSub._id}} ,{new: true})
    if(!removeSub) throw new CustomError(401 , "removeSubcategory is missing");
    apiResponse.sendSuccess(res , 200 , "remove subcategory successfully" , removeSub);
})




