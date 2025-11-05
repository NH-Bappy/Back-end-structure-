const express = require('express');
const _ = express.Router();
const deliveryController = require('../../controller/delivery.controller')

_.route("/create-deliveryCharge").post(deliveryController.createDeliveryCharge)
_.route("/findAll-deliveryCharges").get(deliveryController.findAllDeliveryCharges)
_.route("/find-single-deliveryCharges/:slug").get(deliveryController.findSingleDeliveryCharges);
_.route("/remove-deliveryCharges/:slug").delete(deliveryController.DeleteDeliveryCharge);

module.exports = _;