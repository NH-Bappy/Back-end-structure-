const express = require('express')
const _ = express.Router()

const courierController = require('../../controller/courier.controller')

_.route("/create-courier").post(courierController.createCourier)
_.route("/multiple-courier").post(courierController.createMultipleCourierOrders)

module.exports = _;