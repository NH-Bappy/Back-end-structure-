require('dotenv').config();
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { apiResponse } = require('../utils/apiResponse');
const { validateOrder } = require('../validation/order.validation');
const deliveryChargeModel = require('../models/deliveryCharge.model');
const cartModel = require("../models/cart.model");
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const variantModel = require('../models/variant.model');
const { fetchTransactionId } = require('../helpers/uniqueId');

// SSLCommerz  from github

const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "development" ? false : true ;  //true for live, false for sandbox







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
    const { user, guestID, shippingInfo, deliveryCharge, paymentMethod } = await validateOrder(req);
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



    // payment Method start 
    if (paymentMethod === "cod"){
        order.paymentMethod = "cod";
        order.paymentStatus = "Pending"
    }else{
        const data = {
            total_amount: 100,
            currency: 'BDT',
            tran_id: 'REF123', // use unique tran_id for each api call
            success_url: 'http://localhost:4000/api/v1/payment/success',
            fail_url: 'http://localhost:4000/api/v1/payment/fail',
            cancel_url: 'http://localhost:4000/api/v1/payment/cancel',
            ipn_url: 'http://localhost:4000/api/v1/payment/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer.',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: 'Customer Name',
            cus_email: 'customer@example.com',
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
        const response = await sslcz.init(data);
        console.log(response.GatewayPageURL);
    }

    // Generate Transaction & Invoice
    const uniqueTransactionId = fetchTransactionId();
    // console.log(uniqueTransactionId);
    order.transactionId = uniqueTransactionId;

    order.orderStatus = "Pending";
    order.totalQuantity = cart.totalProduct;





























});