const { custom, valid } = require('joi');
const couponModel = require('../models/coupon.model');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { validateCoupon } = require('../validation/coupon.validation');

//@desc create coupon
exports.createCoupon = asyncHandler(async (req, res) => {
    const data = await validateCoupon(req);
    // console.log(data);
    const couponObject = await couponModel.create({ ...data });
    if (!couponObject) throw new CustomError(400, "coupon not created please try again");
    apiResponse.sendSuccess(res, 201, "coupon created successfully" ,couponObject);
});

//@desc find all coupon
exports.findAllCoupon = asyncHandler(async (req ,res) => {
    const findCoupon = await couponModel.find();
    if(!findCoupon) throw new CustomError(404 , "coupon not found");
    apiResponse.sendSuccess(res , 200 ,"find all coupon successfully" ,findCoupon);
});

//@desc find single coupon
exports.singleCoupon = asyncHandler(async(req ,res) => {
    const {slug} = req.params;
    if(!slug) throw new CustomError(404 , "slug is missing");
    const couponObject = await couponModel.findOne({slug});
    if(!couponObject) throw new CustomError(404 , "The coupon you are looking for not found");
    apiResponse.sendSuccess(res , 200 ,"coupon found successfully", couponObject);
})

//@desc update coupon
exports.updateCoupon = asyncHandler(async(req , res) => {
    const {slug} = req.params
    const updateData = await validateCoupon(req);
    if(!slug && updateData) throw new CustomError(404 ,"slug and update data is missing");
    // console.log(updateData)
    const couponUpdate = await couponModel.findOneAndUpdate({slug} , {...updateData} ,{new: true });
    if(!couponUpdate) throw new CustomError(304 , "coupon not updated");
    apiResponse.sendSuccess(res , 200 ,"coupon updated successfully" ,couponUpdate);
});

//@desc delete coupon
exports.deleteCoupon = asyncHandler(async (req ,res) => {
    const {slug} = req.params;
    if(!slug) throw new CustomError(404 , "slug is missing");
    const deleteCoupon = await couponModel.findOneAndDelete({slug});
    if(!deleteCoupon) throw new CustomError(404 , "coupon not found");
    apiResponse.sendSuccess(res , 200 , "coupon deleted successfully" ,deleteCoupon);
});