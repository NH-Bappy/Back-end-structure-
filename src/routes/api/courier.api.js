const express = require('express')
const _ = express.Router()

const courierController = require('../../controller/courier.controller')

_.route("/create-courier").post(courierController.createCourier);
_.route("/multiple-courier").post(courierController.createMultipleCourierOrders);
_.route("/check-delivery-status").get(courierController.checkDeliveryStatus);
_.route('/current-balance').get(courierController.currentBalance);

module.exports = _;