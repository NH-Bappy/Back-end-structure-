const express = require('express');
const _ = express.Router()
const paymentGatewayController = require('../../controller/Paymentgateway.controller')




_.route("/success").post(paymentGatewayController.success)

module.exports = _;