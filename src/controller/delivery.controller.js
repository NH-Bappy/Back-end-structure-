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

