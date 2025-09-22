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

exports.getAllDiscount = asyncHandler(async (req, res) => {
    const findAllDiscount = await discountModel.find()
        .populate("targetCategory")
        .populate("targetSubcategory")
        .sort({ createdAt: -1 });
    if (!findAllDiscount) throw new CustomError(400, "Discount not available.");
    apiResponse.sendSuccess(res, 200, "All discounts retrieved successfully", findAllDiscount);
});

//@desc get single discount

exports.findOneDiscount = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(401, " The slug does not match");
    const singleDiscount = await discountModel.findOne({ slug })
        .populate("targetCategory")
        .populate("targetSubcategory");
    if (!singleDiscount) throw new CustomError(400, "Discount not available.");
    apiResponse.sendSuccess(res, 200, "single discounts retrieved successfully", singleDiscount);
});


//@desc update discount
exports.modifyDiscount = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(401, " The slug does not match");

    // Validate request body according to schema
    const newData = await validateDiscount(req);

    // Find current discount by slug
    const currentDiscount = await discountModel.findOne({ slug });
    if (!currentDiscount) throw new CustomError(400, "old discount not found");

    // Update discount document with new data
    // - new: true => return updated document
    // - runValidators: true => enforce schema rules
    const discountAfterUpdate = await discountModel.findOneAndUpdate(
        { slug },
        newData,
        { new: true, runValidators: true }
    );
    if (!discountAfterUpdate) throw new CustomError(400, "failed to update discount");

    // Store updated discount ID for reference updates
    const discountId = discountAfterUpdate._id;

    // === Handle category plan updates ===
    if (
        currentDiscount.discountPlan === "category" &&
        currentDiscount.targetCategory?.toString() !==
        discountAfterUpdate.targetCategory?.toString()
    ) {
        // Remove discount from old category
        await categoryModel.findByIdAndUpdate(
            currentDiscount.targetCategory,
            { $pull: { discount: discountId } }
        );

        // Add discount to new category
        await categoryModel.findByIdAndUpdate(
            discountAfterUpdate.targetCategory,
            { $addToSet: { discount: discountId } } // avoids duplicates
        );
    }

    // === Handle subcategory plan updates ===
    if (
        currentDiscount.discountPlan === "subcategory" &&
        currentDiscount.targetSubcategory?.toString() !==
        discountAfterUpdate.targetSubcategory?.toString()
    ) {
        // Remove discount from old subcategory
        await subCategoryModel.findByIdAndUpdate(
            currentDiscount.targetSubcategory,
            { $pull: { discount: discountId } }
        );

        // Add discount to new subcategory
        await subCategoryModel.findByIdAndUpdate(
            discountAfterUpdate.targetSubcategory,
            { $addToSet: { discount: discountId } }
        );
    }

    // Send success response with updated discount data
    apiResponse.sendSuccess(res, 200, "discount update successfully", discountAfterUpdate);
});


//@ delete discount
exports.removeDiscount = asyncHandler(async (req ,res) => {
    const {slug} = req.params;
    if (!slug) throw new CustomError(401, " The slug does not match");

    // Find the discount first
    const discountObject = await discountModel.findOne({slug});
    if(!discountObject) throw new CustomError(400 , "failed to find discount");
    console.log(discountObject)


    const discountId = discountObject._id

    // Remove discount reference from category
    if(discountObject.discountPlan === "category"){
        await categoryModel.findByIdAndUpdate(discountObject.targetCategory , {$pull: {discount:discountId}})
    };

    // Remove discount reference from subcategory
    if(discountObject.discountPlan == "subcategory"){
        await subCategoryModel.findByIdAndUpdate(discountObject.targetSubcategory , {$pull : {discount:discountId}})
    };

    // delete the discount
    const discountDelete = await discountModel.deleteOne(discountId)

    apiResponse.sendSuccess(res , 200 , "delete discount successfully" , discountDelete)

});