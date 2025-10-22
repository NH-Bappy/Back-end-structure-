const express = require('express');
const _ = express.Router();
const cartController = require('../../controller/cart.controller');

_.route("/add-to-cart").post(cartController.addToCart);
_.route("/apply-coupon").post(cartController.applyCoupon);
_.route("/item-increment").post(cartController.itemIncrement);

module.exports = _;