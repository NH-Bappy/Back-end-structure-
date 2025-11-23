const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const orderModel = require('../models/order.model');
const { default: mongoose } = require('mongoose');
const { API } = require('../helpers/axios');






exports.createCourier = asyncHandler(async(req ,res) => {
    const { courierId } = req.body;

    // Validate courierId
    if (!mongoose.Types.ObjectId.isValid(courierId)) {
        throw new CustomError(400, "Invalid courierId");
    }

    // Fetch order
    const orderObject = await orderModel.findById(courierId);
    if (!orderObject) throw new CustomError(404, "Order not found");


    const { shippingInfo, invoiceId, finalAmount,} = orderObject;

    const courierPayload = {
        invoice: invoiceId,
        recipient_name: shippingInfo.firstName,
        recipient_phone: shippingInfo.phone,
        // recipient_email: shippingInfo.email,
        recipient_address: shippingInfo.address,
        cod_amount: finalAmount
    }
    const response = await API.post("/create_order", courierPayload)
    // console.log(response)
    // return


    if (!response.data || response.data.status !== 200) {
        throw new CustomError(500,response.data?.message || "Failed to create courier order");
    }


    const { consignment } = response.data;

    orderObject.courier = orderObject.courier || {};


    orderObject.courier.name ="Steadfast";
    orderObject.courier.trackingId = consignment.tracking_code;
    orderObject.courier.rawResponse = consignment;
    orderObject.courier.status = consignment.status;
    orderObject.orderStatus = consignment.status;
    await orderObject.save()

    apiResponse.sendSuccess(res, 200, "successfully created courier order", {
        trackingId: consignment.tracking_code,
        message: response.data.message,
        consignment,
    });
    
});

//@ create bulk courier order
exports.createMultipleCourierOrders = asyncHandler(async (req , res) => {
    const {orderId} = req.body;
    if(!Array.isArray(orderId) || orderId.length === 0){
        throw new CustomError(400 , "")
    }
});