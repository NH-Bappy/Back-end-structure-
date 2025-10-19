const cartModel = require('../models/cart.model');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { cartValidation } = require('../validation/cart.validation');
const productModel = require('../models/product.model');
const variantModel = require('../models/variant.model');
const couponModel = require('../models/coupon.model');
const { boolean } = require('joi');



// Helper: Calculate coupon discount
const calculateCouponDiscount = async (coupon) => {
    try {
        const couponInstance = await couponModel.findOne({ code: coupon });
        if (!couponInstance) throw new CustomError(404, "Coupon not found!");
        console.log(couponInstance);
        const { expireAt,
            usageLimit,
            usedCount,
            isActive,
            discountType,
            discountValue
        } = couponInstance
        if (expireAt <= Date.now() && isActive == Boolean(false)){
            throw new CustomError(404 , "coupon is expired!")
        };




    } catch (error) {
        console.log("Error from apply coupon", error);
    }
};





//add to cart
exports.addToCart = asyncHandler(async (req, res) => {
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




    // Get product or variant price
    if (productID) {
        // Find the full product document from the database using the provided productID
        product = await productModel.findById(productID);
        // Store the product's retail price in the variable 'price' for later calculations
        price = product.retailPrice;
    }

    if (variantID) {
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
        coupon
    });





    // Find or create cart
    cart = await cartModel.findOne(query);
    if (!cart) {
        cart = new cartModel({
            user: user,
            guestID: guestID,
            items: [makeCartItem()],
        })
    } else {
        // This code runs only if the cart already exists
        const findItemIndex = cart.items.findIndex(
            (cartItem) =>
                (productID && cartItem.product == productID)
                ||
                (variantID && cartItem.variant == variantID)
        );



        if (findItemIndex >= 0) {
            // Item already exists → increase quantity
            const qty = quantity || 1;
            cart.items[findItemIndex].quantity += qty;
            cart.items[findItemIndex].unitTotalPrice =
                Math.floor(cart.items[findItemIndex].price * cart.items[findItemIndex].quantity);
        } else {
            // Item does not exist → add new
            cart.items.push(makeCartItem());
        }
    }


    // [Calculate totals]

    // accumulator(acc) → stores running totals
    // currentValue(item) → the element from the array that’s currently being processed.
    // initialValue → the starting value of the accumulator

    const totals = cart.items.reduce((accumulator, item) => {
        accumulator.totalAmount += item.unitTotalPrice;
        accumulator.totalQuantity += item.quantity;
        return accumulator
    },
        { totalAmount: 0, totalQuantity: 0 }
    );
    cart.totalAmountOfWholeProduct = totals.totalAmount;
    // Saves total cost of all products 
    cart.totalProduct = totals.totalQuantity;
    // Saves total quantity of products




    console.log(totals)
    // cart.items.push(makeCartItem())
    if (coupon) {
        await calculateCouponDiscount(coupon)
    }
    await cart.save()
    // console.log(cart);

    apiResponse.sendSuccess(res, 200, "create cart successfully", cart)
});


// Apply Coupon
// exports.applyCoupon = asyncHandler(async(req ,res)=> {
//     const { coupon, guestID, user } = req.body;
//     // console.log(user)

//     const query = user ? {user} : guestID;

//     const cartObject = await cartModel.findOne({ query });
//     if (!cartObject) throw new CustomError(404, "cartObject not found!");

//     const couponData = await calculateCouponDiscount(cartObject , coupon);
//     console.log(couponData);
// })























































































