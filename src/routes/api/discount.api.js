const express = require('express');
const _ = express.Router();
const discountController = require('../../controller/discount.controller');



_.route("/create-discount").post(discountController.newDiscountCreate);


module.exports = _;