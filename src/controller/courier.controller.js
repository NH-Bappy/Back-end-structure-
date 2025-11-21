const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const orderModel = require('../models/order.model');
const { default: mongoose } = require('mongoose');






exports.createCourier = asyncHandler(async(req ,res) => {
    const { courierId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(courierId)){
        throw new CustomError(401 , "courier order not found");
    }
    const orderObject = await orderModel.findById(courierId)
    if(!orderObject) throw new CustomError(404 , "order object not found")
    console.log(orderObject)
});