require('dotenv').config();
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { apiResponse } = require('../utils/apiResponse');
const orderModel = require('../models/order.model');
const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "development" ? false : true; 




// success controller 
exports.success = asyncHandler(async (req ,res) => {
    // res
    // .status(301)
    // .redirect('https://github.com/sslcommerz/SSLCommerz-NodeJS')
    // console.log(req.body);
    const { val_id } = req.body;
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validatePayment = await sslcz.validate({
        val_id,
    });
    console.log("validatePayment", validatePayment);

    if (validatePayment.status !== "VALID") throw new CustomError(501, "payment not valid")
        orderModel.findOneAndUpdate(
            { transactionId: validatePayment.tran_id },
            { paymentStatus: validatePayment.status ? "VALID" : "success"}
    )

    apiResponse.sendSuccess(res , 200 , "payment successful")
})


// fail
exports.fail = asyncHandler(async (req ,res) => {
    res
    .status(301)
    .redirect('https://github.com/sslcommerz/SSLCommerz-NodeJS')
})

// cancel
exports.cancel = asyncHandler(async (req ,res) => {
    res
    .status(301)
    .redirect('https://github.com/sslcommerz/SSLCommerz-NodeJS')
})

// ipn
exports.ipn = asyncHandler(async (req ,res) => {
    res
    .status(301)
    .redirect('https://github.com/sslcommerz/SSLCommerz-NodeJS')
})