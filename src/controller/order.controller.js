const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { apiResponse } = require('../utils/apiResponse');
const { validateOrder } = require('../validation/order.validation');
const deliveryChargeModel = require('../models/deliveryCharge.model');
const cartModel = require("../models/cart.model");
const orderModel = require('../models/order.mode');
const productModel = require('../models/product.model');
const variantModel = require('../models/variant.model');

exports.createOrder = asyncHandler(async(req , res) => {
    const { user, guestID, shippingInfo, deliveryCharge } = await validateOrder(req);
    // console.log(value)
    const Id = user ? { user } : { guestID }
    console.log(Id)
    const cart = await cartModel.findOne(Id);
    // console.log(cart);

    // stock reduce
});