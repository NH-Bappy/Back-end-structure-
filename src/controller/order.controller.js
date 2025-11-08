const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { apiResponse } = require('../utils/apiResponse');
const { validateOrder } = require('../validation/order.validation');
const deliveryChargeModel = require('../models/deliveryCharge.model');
const cartModel = require("../models/cart.model");
const orderModel = require('../models/order.mode');
const productModel = require('../models/product.model');
const variantModel = require('../models/variant.model');

exports.createOrder = asyncHandler(async (req, res) => {
    const { user, guestID, shippingInfo, deliveryCharge } = await validateOrder(req);
    // console.log(value)
    const Id = user ? { user } : { guestID }
    console.log(Id)
    const cart = await cartModel.findOne(Id);
    if (!cart) throw new CustomError(404, "Cart not found");
    // console.log(cart);

    // return
    // stock reduce


    Promise.all(
        cart.items.map((item) => {
            if (item.product) {
                productModel.findOneAndDelete({ _id: item.product }, { $inc: { item: -item.quantity } }
                )
            }
        })
    );
});