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
const calculateCouponDiscount = async ( totalBeforeDiscount ,coupon) => {
    let totalAfterDiscount = 0;
    let off = 0;
    try {
        const couponData = await couponModel.findOne({ code: coupon });
        // console.log(couponData)
        if (!couponData) throw new CustomError(404, "Coupon not found!");
        // console.log(couponData);
        const { expireAt,
            usageLimit,
            usedCount,
            isActive,
            discountType,
            discountValue
        } = couponData

        if (expireAt <= Date.now() && isActive == Boolean(false)){
            throw new CustomError(404 , "coupon is expired!")
        };

        if (usageLimit < usedCount) throw new CustomError(403 , "the limit is expired");

        if (discountType == "percentage"){
            off = Math.ceil((totalBeforeDiscount * discountValue) / 100);
            totalAfterDiscount = Math.ceil(totalBeforeDiscount - off);
            // console.log(totalAfterDiscount)
        }else{
            totalAfterDiscount = Math.ceil(totalBeforeDiscount - discountValue);
        }
        // Track how many times this discount has been used (increase usedCount)
        couponData.usedCount += 1;
        await couponData.save();
        return{
            couponData,
            off,
            totalAfterDiscount,
        }
    } catch (error) {
        // Rollback usedCount if something failed
        if (couponData){
            await couponModel.findOneAndUpdate({ code: coupon }, {usedCount : usedCount -1});
        }
        throw new CustomError(404 , "error from calculate error" ,error);
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
        coupon,
        decreaseQuantity = 0 // new: how much to decrease
    } = await cartValidation(req);

    const query = user ? { user } : { guestID }

    // now make a addToCartObject
    let cart = {};
    let product = {};
    let variant = {};
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
    const makeCartItem = () => {
        const itemQuantity = quantity < 1 ? 1 : quantity; // minimum 1 for new item
        return {
            product: productID || null,
            variant: variantID || null,
            quantity: itemQuantity,
            price,
            unitTotalPrice: Math.floor(price * itemQuantity),
            size,
            color,
            coupon
        };
    };

    // Find or create cart
    cart = await cartModel.findOne(query);
    if (!cart) {
        cart = new cartModel({
            user: user || null,
            guestID: guestID || null,
            items: [makeCartItem()],
        });
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
            const qty = quantity || 0;
            cart.items[findItemIndex].quantity += qty;

            // Decrease quantity if decreaseQuantity is provided
            if (decreaseQuantity > 0) {
                cart.items[findItemIndex].quantity -= decreaseQuantity;
                if (cart.items[findItemIndex].quantity < 1)
                    cart.items[findItemIndex].quantity = 1; // never below 1
            }

            // Update unit total price
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

    await cart.save()
    // console.log(cart);

    apiResponse.sendSuccess(res, 200, "create cart successfully", cart)
});



// Apply Coupon
exports.applyCoupon = asyncHandler(async(req ,res)=> {
    const { coupon, guestID, user } = req.body;
    // console.log(user)

    const query = user ? { user } : { guestID };

    const cartObject = await cartModel.findOne(query);
    // console.log(cartObject)
    if (!cartObject) throw new CustomError(404, "cartObject not found!");

    const { couponData, off, totalAfterDiscount } = await calculateCouponDiscount(
        cartObject.totalAmountOfWholeProduct, 
        coupon);

    // console.log(couponData);
    // console.log(off);
    // console.log(totalAfterDiscount);
    cartObject.coupon = couponData._id;
    // saves which coupon was applied to the cart.
    cartObject.discountAmount = off;
    // stores how much discount was given.
    cartObject.discountType = couponData.discountType;
    // records whether the discount was a percentage or fixed.
    cartObject.totalAmountOfWholeProduct = totalAfterDiscount;
    // updates the cart’s total price after applying the discount.
    await cartObject.save();
    apiResponse.sendSuccess(res, 200, "apply coupon successfully", cartObject);
});


//@desc increment product quantity
exports.itemIncrement = asyncHandler(async (req, res) => {
    const { itemID } = req.body;
    await cartModel.updateOne(
        { "items._id": itemID },
        { $inc: { "items.$.quantity": 1 } }
    );
    console.log(cartObject)
});






















































































