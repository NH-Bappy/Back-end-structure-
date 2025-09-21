const discountModel = require('../models/discount.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { validateDiscount } = require('../validation/discount.validation');
const categoryModel = require('../models/category.model');
const subCategoryModel = require('../models/subCategory.model');
const { CustomError } = require('../utils/customError');
const { apiResponse } = require('../utils/apiResponse');



//@desc create discount

exports.newDiscountCreate = asyncHandler(async (req, res) => {
    const data = await validateDiscount(req);
    // console.log(data)
    // now save the object into mongoDB

    // Create a new subcategory document in the database using the validated values
    const discountObject = await discountModel.create({ ...data }); // newly created subcategory object
    if (!discountObject) throw new CustomError(400, "discount create fail check the information again")

    //now update the categoryModel
    if (discountObject.discountPlan === "category") {
        if (!discountObject.targetCategory) {
            throw new CustomError(400, "Target category ID is missing");
        }

        const addDiscount = await categoryModel.findByIdAndUpdate(
            { _id: discountObject.targetCategory },                    // category ID
            { $addToSet: { discount: discountObject._id } }, // add discount without duplicates
            { new: true }                                    // return updated doc
        );
    };

    // now update the subcategoryModel
    if (discountObject.discountPlan === "subcategory") {
        if (!discountObject.targetSubcategory) {
            throw new CustomError(400, "Target subcategory ID is missing");
        }
        const addDiscount = await subCategoryModel.findByIdAndUpdate(
            { _id: discountObject.targetSubcategory }, { $addToSet: { discount: discountObject._id } },
            { new: true }
        )
    };
    apiResponse.sendSuccess(res, 200, "discount create successfully", discountObject)
});

//@desc get all discount