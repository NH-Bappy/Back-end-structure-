const reviewModel = require('../models/review.model');
const productModel = require('../models/product.model');
const variantModel = require('../models/variant.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { apiResponse } = require("../utils/apiResponse");
const { validateReview } = require('../validation/review.validation');
const { CustomError } = require('../utils/customError');

//@desc create review
exports.createReview = asyncHandler(async (req, res) => {
    const value = await validateReview(req);
    const reviewObject = await reviewModel.create(value);
    if (!reviewObject) throw new CustomError(500, "Failed to create review");

    // console.log(reviewObject)
    // return
    // Prepare update promises
    const promiseArray = [];

    // Push review ID to related product or variant
    if (value.product) {
        promiseArray.push(
            productModel.findOneAndUpdate(
                { _id: value.product },
                { $push: { reviews: reviewObject._id } },
                { new: true }
            )
        );
    }

    if (value.variant) {
        promiseArray.push(
            variantModel.findOneAndUpdate(
                { _id: value.variant },
                { $push: { reviews: reviewObject._id } },
                { new: true }
            )
        );
    }

    await Promise.all(promiseArray);
    apiResponse.sendSuccess(res, 201, "Review created successfully", reviewObject);
});

//@ get all review 
exports.getAllReview = asyncHandler(async (req, res) => {
    const reviewObject = await reviewModel.find().sort({ createdAt: -1 });
    if (!reviewObject) throw new CustomError(404, "all reviews not found");
    apiResponse.sendSuccess(res, 200, "successfully founded all the review", reviewObject)
})

//@ find single review 

exports.getSingleReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new CustomError(404, "id is missing");
    const reviewObject = await reviewModel.findOne({ _id: id });
    if (!reviewObject) throw new CustomError(404, "single review not found");
    apiResponse.sendSuccess(res, 200, "successfully found the review", reviewObject);
});

//@update review
exports.reviewUpdate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new CustomError(404, "id is missing");
    const updateReview = await reviewModel.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });
    if (!updateReview) throw new CustomError(304, "review not modified")
    apiResponse.sendSuccess(res, 200, "review modified successfully", updateReview)
});

//@delete review
exports.deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new CustomError(404, "id is missing");
    const deleteReview = await reviewModel.findOneAndDelete({ _id: id });
    if (!deleteReview) throw new CustomError(404, "review not found or already deleted")
        // console.log(deleteReview)
        // return
    if (deleteReview.reviewer) {
        await productModel.findOneAndUpdate(
            { _id: deleteReview.reviewer },
            { $pull: { reviews: deleteReview._id } },
            { new: true }
        );
    }
    if (deleteReview.variant) {
        await variantModel.findOneAndUpdate(
            { _id: deleteReview.variant },
            { $pull: { reviews: deleteReview._id } },
            { new: true }
        );
    }
    apiResponse.sendSuccess(res, 200, "successfully deleted the review", deleteReview);
});








