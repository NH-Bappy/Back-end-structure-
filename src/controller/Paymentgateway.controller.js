const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { apiResponse } = require('../utils/apiResponse');
const orderModel = require('../models/order.model');

// success controller 
exports.success = asyncHandler(async (req ,res) => {
    res
    .status(301)
    .redirect('https://github.com/sslcommerz/SSLCommerz-NodeJS')
})