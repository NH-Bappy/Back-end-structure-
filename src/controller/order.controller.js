const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { apiResponse } = require('../utils/apiResponse');
const { validateOrder } = require('../validation/order.validation');
const deliveryChargeModel = require('../models/deliveryCharge.model');
const cartModel = require("../models/cart.model");
const orderModel = require('../models/order.mode');
const productModel = require('../models/product.model');
const variantModel = require('../models/variant.model');










// Helper: Calculate Delivery Charge
const deliveryChargeCalculate = async (deliveryCharge) => {
    try {
    return await deliveryChargeModel.findById(deliveryCharge);
        // console.log(charge);
    } catch (error) {
        throw new CustomError(501 , "error from delivery charge calculate")
    }
}


exports.createOrder = asyncHandler(async (req, res) => {
    const { user, guestID, shippingInfo, deliveryCharge } = await validateOrder(req);
    // console.log(value)
    const Id = user ? { user } : { guestID }
    // console.log(Id)
    const cart = await cartModel.findOne(Id);
    if (!cart) throw new CustomError(404, "Cart not found");
    // console.log(cart);

    // return


    // stock || quantity reduce
    const productQuantity = await Promise.all(
        cart.items.map(async (item) => {
            if (item.product) {
                return await productModel
                    .findOneAndUpdate(
                        { _id: item.product },
                        { $inc: { stock: -item.quantity, totalSale: item.quantity } },
                        { new: true }
                    )
                    .select("-QrCode -barCode -updatedAt -tag -reviews");
            } else {
                return await variantModel
                    .findOneAndUpdate(
                        { _id: item.variant},
                        { $inc: { stockVariant: -item.quantity, totalSale: item.quantity } },
                        { new: true }
                    )
                    .select("-QrCode -barCode -updatedAt -tag -reviews");
            }
        })
    );

    // console.log(productQuantity);

    // create order object
    const order = new orderModel({
        user,
        guestID,
        items: productQuantity,
        shippingInfo,
        deliveryCharge,
        coupon: cart.coupon,
        discountAmount: cart.discountAmount,
    })

    // console.log(order)

    // apply delivery Fee and set finalAmount
    const DeliveryFee = await deliveryChargeCalculate(deliveryCharge);
    // console.log(DeliveryFee)
    order.finalAmount = Math.floor(cart.totalAmountOfWholeProduct + DeliveryFee.amount) - cart.discountAmount;
    order.deliveryZone = DeliveryFee.name;



































});