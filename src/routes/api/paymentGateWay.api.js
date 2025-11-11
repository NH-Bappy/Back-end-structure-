const express = require('express');
const _ = express.Router()
const paymentGatewayController = require('../../controller/Paymentgateway.controller')




_.route("/success").post(paymentGatewayController.success)
_.route("/fail").post(paymentGatewayController.fail)
_.route("/cancel").post(paymentGatewayController.cancel)
_.route("/ipn").post(paymentGatewayController.ipn)

module.exports = _;