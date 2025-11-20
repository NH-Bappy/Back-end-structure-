const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const orderModel = require('../models/order.model');






exports.createCourier = asyncHandler(async(req ,res) => {
    const { courierId } = req.body;
    console.log(courierId)
});