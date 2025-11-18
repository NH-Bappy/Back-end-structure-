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
const { fetchTransactionId, getAllProductName } = require('../helpers/uniqueId');
// Invoice
const invoiceModel = require('../models/invoice.model');
// SSLCommerz  from github

const SSLCommerzPayment = require('sslcommerz-lts');
const Invoice = require('../models/invoice.model');
const { default: mongoose } = require('mongoose');
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "development" ? false : true;  //true for live, false for sandbox







// Helper: Calculate Delivery Charge
const deliveryChargeCalculate = async (deliveryCharge) => {
    try {
        return await deliveryChargeModel.findById(deliveryCharge);
        // console.log(charge);
    } catch (error) {
        throw new CustomError(501, "error from delivery charge calculate")
    }
}


exports.createOrder = asyncHandler(async (req, res) => {
    const { user, guestID, shippingInfo, deliveryCharge, paymentMethod } = await validateOrder(req);
    // console.log(paymentMethod)
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
                        { _id: item.variant },
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


    // Generate Transaction & Invoice
    const uniqueTransactionId = fetchTransactionId();
    // console.log(uniqueTransactionId);
    order.transactionId = uniqueTransactionId;
    const productName = getAllProductName(order.items);
    // console.log(productName)


    // order.orderStatus = "Pending";
    // order.totalQuantity = cart.totalProduct;


    // make a invoice
    const invoice = await invoiceModel.create({
        invoiceId: order.transactionId,
        order: order._id,
    });

    order.invoiceId = invoice.invoiceId;

    // payment Method start 
    if (paymentMethod === "cod") {
        order.paymentMethod = "cod";
        order.paymentStatus = "Pending";
        await order.save()

        apiResponse.sendSuccess(res, 200, "offline order created successfully (cod)", order);
    }



    if (paymentMethod === "online") {
        const data = {
            total_amount: order.finalAmount,
            currency: 'BDT',
            tran_id: order.transactionId, // use unique tran_id for each api call
            success_url: 'http://localhost:4000/api/v1/payment/success',
            fail_url: 'http://localhost:4000/api/v1/payment/fail',
            cancel_url: 'http://localhost:4000/api/v1/payment/cancel',
            ipn_url: 'http://localhost:4000/api/v1/payment/ipn',
            shipping_method: 'Courier',
            product_name: productName,
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: shippingInfo.firstName,
            cus_email: shippingInfo.email,
            cus_add1: shippingInfo.address,
            cus_add2: shippingInfo.address,
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            // cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: shippingInfo.phone,
            // cus_fax: '01711111111',
            ship_name: shippingInfo.firstName,
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };
        try {
            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            const response = await sslcz.init(data);
            // console.log(response.GatewayPageURL);



            order.orderStatus = "Pending";
            order.paymentMethod = "online"
            order.totalQuantity = cart.totalProduct;
            order.invoiceId = invoice.invoiceId;
            await order.save()

            console.log("ssl commerz response", response)

            apiResponse.sendSuccess(res, 200, "order successful", {
                url: response.GatewayPageURL,
            });


        } catch (error) {
            // product Roll back

            await Promise.all(
                cart.items.map(async (item) => {
                    if (item.product) {
                        return await productModel
                            .findOneAndUpdate(
                                { _id: item.product },
                                { $inc: { stock: item.quantity, totalSale: -item.quantity } },
                                { new: true }
                            )
                            .select("-QrCode -barCode -updatedAt -tag -reviews");
                    } else {
                        return await variantModel
                            .findOneAndUpdate(
                                { _id: item.variant },
                                {
                                    $inc: {
                                        stockVariant: item.quantity,
                                        totalSale: -item.quantity
                                    }
                                },
                                { new: true }
                            )
                            .select("-QrCode -barCode -updatedAt -tag -reviews");
                    }
                })
            );



            // delete invoice
            await invoiceModel.findOneAndDelete({ invoiceId: order.invoiceId })
            if (!response.GatewayPageURL) throw new CustomError(501, "online payment fail")
        }
    }
});

// get all order

exports.getallOrder = asyncHandler(async(req ,res ) => {
    const { MobileNumber } = req.query;
    const findOrder = await orderModel.find(MobileNumber ? { "shippingInfo.phone": { $regex: MobileNumber , $options: "i"}} : {}).sort({createdAt: -1})
    apiResponse.sendSuccess(res , 200 , "successfully found order" , findOrder)
});

// get all order status
exports.allStatus = asyncHandler(async (req ,res) => {
    const allOrderStatus = await orderModel.aggregate([
        {
            $group:{
                _id: "$orderStatus",
                count:{$sum: 1},
            }
        },
        {
            $group:{
                _id: null,
                totalOrder: { $sum: "$count" },
                breakdown:{
                    $push:{
                        orderStatus: "$_id",
                        count: "$count",
                    },
                },
            },
        },
        {//Removes _id Keeps only totalOrders and breakdown
            $project:{
                _id: 0,
                totalOrder: 1 ,
                breakdown: 1 ,
            },
        },
    ])
    apiResponse.sendSuccess(res, 200, "order status found successfully", allOrderStatus)
});

// update order by Id
exports.updateOrder = asyncHandler(async(req , res) => {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new CustomError(401 , "Invalid order id");
    }
    const modifyOrder = await orderModel.findOneAndUpdate({_id: id} , {...req.body} , {new: true});
    if(!modifyOrder) throw new CustomError(404 , "order not found")
    apiResponse.sendSuccess(res , 200 , "order modified successfully" , modifyOrder)
});


























