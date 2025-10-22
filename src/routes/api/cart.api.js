const express = require('express');
const _ = express.Router();
const cartController = require('../../controller/cart.controller');

_.route("/add-to-cart").post(cartController.addToCart);
_.route("/apply-coupon").post(cartController.applyCoupon);
// _.route("/get-cart").get(cartController.getCart)
// _.route("/remove-Item").put(cartController.removeItem);
// _.route("/clear-cart").delete(cartController.clearCart);
module.exports = _;