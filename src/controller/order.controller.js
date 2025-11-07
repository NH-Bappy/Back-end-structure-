const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { apiResponse } = require('../utils/apiResponse');
const cartModel = require('../models/cart.model');
const orderModel = require('../models/order.mode')
const { validateOrder } = require('../validation/order.validation');
const deliveryChargeModel = require('../models/deliveryCharge.model');


exports.createOrder = asyncHandler(async(req , res) => {
    const { user, guestId, shippingInfo, deliveryCharge } = await validateOrder(req);
    console.log(value)
});