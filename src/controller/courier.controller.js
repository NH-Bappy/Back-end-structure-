const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const orderModel = require('../models/order.model');
const { default: mongoose } = require('mongoose');
const { API } = require('../helpers/axios');






exports.createCourier = asyncHandler(async(req ,res) => {
    const { courierId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(courierId)){
        throw new CustomError(401 , "courier order not found");
    }
    const orderObject = await orderModel.findById(courierId)
    if(!orderObject) throw new CustomError(404 , "order object not found")
    const { shippingInfo, invoiceId, finalAmount,} = orderObject;
    const courierPayload = {
        invoice: invoiceId,
        recipient_name: shippingInfo.firstName,
        recipient_phone: shippingInfo.phone,
        recipient_email: shippingInfo.email,
        recipient_address: shippingInfo.address,
        cod_amount: finalAmount
    }
    const response = await API.post("/create_order", courierPayload)
    console.log(response)
});