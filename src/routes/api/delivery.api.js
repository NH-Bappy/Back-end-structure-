const express = require('express');
const _ = express.Router();
const deliveryController = require('../../controller/delivery.controller')

_.route("/create-deliveryCharge").post(deliveryController.createDeliveryCharge)

module.exports = _;