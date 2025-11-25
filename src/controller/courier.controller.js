const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const orderModel = require('../models/order.model');
const { default: mongoose } = require('mongoose');
const { API } = require('../helpers/axios');






exports.createCourier = asyncHandler(async (req, res) => {
    const { courierId } = req.body;

    // Validate courierId
    if (!mongoose.Types.ObjectId.isValid(courierId)) {
        throw new CustomError(400, "Invalid courierId");
    }

    // Fetch order
    const orderObject = await orderModel.findById(courierId);
    if (!orderObject) throw new CustomError(404, "Order not found");


    const { shippingInfo, invoiceId, finalAmount, } = orderObject;

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
        throw new CustomError(500, response.data?.message || "Failed to create courier order");
    }


    const { consignment } = response.data;

    orderObject.courier = orderObject.courier || {};


    orderObject.courier.name = "Steadfast";
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
exports.createMultipleCourierOrders = asyncHandler(async (req, res) => {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
        throw new CustomError(400, "invalid or empty order ids array")
    }

    // for sendSuccess message
    let lastBulkResponse = null;
    let lastConsignment = null;

    // Iterate through each order ID to process it individually
    for (let singleOrder of orderIds) {
        if (!mongoose.Types.ObjectId.isValid(singleOrder)) {
            throw new CustomError(400, "not found any order id")
        }

        // Fetch order from the database
        const orderObject = await orderModel.findById(singleOrder);
        if (!orderObject) throw new CustomError(404, "not found any order");
        // console.log(orderObject)



        const { invoiceId, shippingInfo, finalAmount } = orderObject;
        const courierBulkPayload = {
            invoice: invoiceId,
            recipient_name: shippingInfo.firstName,
            recipient_phone: shippingInfo.phone,
            recipient_address: shippingInfo.address,
            cod_amount: finalAmount,
        }

        // Create the courier order
        const BulkResponse = await API.post('/create_order', courierBulkPayload);
        if (!BulkResponse.data || BulkResponse.data.status !== 200) throw new CustomError(400, "failed to create bulk order")
        // console.log(BulkResponse);

        // Update the order with courier info if needed
        const { consignment } = BulkResponse.data

        orderObject.courier = orderObject.courier || {};

        orderObject.courier.name = "steadFast";
        orderObject.courier.trackingId = consignment.tracking_code;
        orderObject.courier.rawResponse = consignment
        orderObject.courier.status = consignment.status
        orderObject.orderStatus = consignment.status
        await orderObject.save()

        // for sendSuccess message
        lastBulkResponse = BulkResponse;
        lastConsignment = consignment;
    }
    
    apiResponse.sendSuccess(res, 200, "successfully created bulk order", {
        trackingId: lastConsignment.tracking_code,
        message: lastBulkResponse.data.message,
        lastConsignment,
    })
});


// Checking Delivery Status
exports.checkDeliveryStatus = asyncHandler(async (req , res) => {
    const { trackingId } = req.query;
    const deliveryStatusResponse = await API.get(`/status_by_trackingcode/${trackingId}`)
    // console.log(deliveryStatusResponse)
    // return
    if(!deliveryStatusResponse.data || deliveryStatusResponse.data.status !== 200){
        throw new CustomError(500 , "failed to fetch delivery status")
    }
    apiResponse.sendSuccess(res , 200 , "Delivery status found successfully" ,deliveryStatusResponse.data)
});

// get current balance
exports.currentBalance = asyncHandler(async(req ,res) => {
    const balanceResponse = await API.get("/get_balance")
    if (!balanceResponse.data || balanceResponse.data.status !== 200) {
        throw new CustomError(500, "failed to fetch delivery status")
    }
    apiResponse.sendSuccess(res, 200, "Delivery status found successfully", balanceResponse.data)
})


// create return request
exports.createReturnStatus = asyncHandler(async(req ,res) => {
    const { consignment_id } = req.body;
    if (!consignment_id) throw new CustomError(400, "consignment Id is missing" );
    // console.log(consignment_id);

    const returnResponse = await API.post("/create_return_request", {
        consignment_id,
        reason: "Customer Request for return"
    });
    // console.log(returnResponse);
    if (!returnResponse?.data) throw new CustomError(500 , "failed to create return request");

    // find order and update its status
    const orderObject = await orderModel.findOne({
        invoiceId: returnResponse.data.consignment.invoice
    });
    // console.log(orderObject)
    if(!orderObject) throw new CustomError(404 , "order not found");


    // update order status
    orderObject.returnStatus = "requested";
    orderObject.returnId = returnResponse.data.id;
    orderObject.orderStatus = returnResponse.data.status;
    orderObject.returnStatusHistory = returnResponse.data
    await orderObject.save()

    apiResponse.sendSuccess(res , 200 ,"return request created successfully" ,returnResponse.data)




});


















