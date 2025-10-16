const cartModel = require('../models/cart.model');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { cartValidation } = require('../validation/cart.validation');
const productModel = require('../models/product.model');
const variantModel = require('../models/variant.model');


//add to cart
exports.addToCart = asyncHandler(async(req , res) => {
    const {
        user,
        guestID,
        productID,
        variantID,
        color,
        size,
        quantity,
        coupon
    } = await cartValidation(req);
    const { query } = user ? { user } : { guestID }
    //now make a addToCartObject
    let cart = {};
    let product = {};
    let variant = {};
    let promiseArr = [];
    let price = 0;

    if (productID) {
        // Find the full product document from the database using the provided productID
        product = await productModel.findById(productID);
        // Store the product's retail price in the variable 'price' for later calculations
        price = product.retailPrice;
    }

    if (variantID){
        // Find the full product document from the database using the provided variantID
        variant = await variantModel.findById(variantID);
        // Store the variant's retail price in the variable 'price' for later calculations
        price = variant.retailPrice;
    }


    // Helper to create a cart item

    const makeCartItem = () => ({
        product: productID || null,
        variant: variantID || null,
        quantity,
        price,
        unitTotalPrice: Math.floor(price * quantity),
        size,
        color,
    });

    // find cart
    cart = await cartModel.findOne(query);
    if(!cart){
        cart = new cartModel({
            user: user,
            guestID: guestID,
            items: [{ makeCartItem }],
        })
    }else{
        console.log("product is already exit")
    }

    console.log(cart)
});
























































































