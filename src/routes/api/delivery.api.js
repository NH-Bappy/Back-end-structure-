const express = require('express');
const _ = express.Router();
const deliveryController = require('../../controller/delivery.controller')

_.route("/create-deliveryCharge").post(deliveryController.createDeliveryCharge)
_.route("/findAll-deliveryCharges").get(deliveryController.findAllDeliveryCharges)

module.exports = _;