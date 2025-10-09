const express = require('express');
const _ = express.Router();
const couponController = require('../../controller/coupon.controller');

_.route("/create-coupon").post(couponController.createCoupon);
_.route("/find-all").get(couponController.findAllCoupon);
_.route("/single-coupon/:slug").get(couponController.singleCoupon);
_.route("/update-coupon/:slug").put(couponController.updateCoupon);
_.route("/delete-coupon/:slug").delete(couponController.deleteCoupon);

module.exports = _;