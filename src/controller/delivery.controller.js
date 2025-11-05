const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const deliveryChargeModel = require('../models/deliveryCharge.model');
const { validateDeliveryCharge } = require('../validation/deliveryCharge.validation');

// create delivery Charge api
exports.createDeliveryCharge = asyncHandler(async(req , res) => {
    const DeliveryChargeObject = await validateDeliveryCharge(req);
    // console.log(DeliveryChargeObject);
    const createDeliveryCharge = await deliveryChargeModel.create({...DeliveryChargeObject });
    if (!createDeliveryCharge) throw new CustomError(402 , "delivery charge not created");
    apiResponse.sendSuccess(res, 200, "successfully created the delivery charge", createDeliveryCharge);
});

// get all the delivery
exports.findAllDeliveryCharges = asyncHandler(async(req ,res) => {
    const findAll = await deliveryChargeModel.find();
    if (!findAll) throw new CustomError(402, "delivery charge not found");
    apiResponse.sendSuccess(res, 200, "successfully found all the delivery charge", findAll);
})

// find single product

exports.findSingleDeliveryCharges = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) {throw new CustomError(401, "Slug Not Found")}
    const findOne = await deliveryChargeModel.findOne({slug});
    if (!findOne) throw new CustomError(402, "delivery charge not found");
    apiResponse.sendSuccess(res, 200, "successfully found the delivery charge", findOne);
})