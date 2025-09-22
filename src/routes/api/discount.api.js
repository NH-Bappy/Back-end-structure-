const express = require('express');
const _ = express.Router();
const discountController = require('../../controller/discount.controller');



_.route("/create-discount").post(discountController.newDiscountCreate);
_.route("/find-all-discount").get(discountController.getAllDiscount);
_.route("/find-one-discount/:slug").get(discountController.findOneDiscount);
_.route("/modify-discount/:slug").put(discountController.modifyDiscount);

module.exports = _;