const express = require('express')
const _ = express.Router()

const courierController = require('../../controller/courier.controller')

_.route("/create-courier").post(courierController.createCourier)

module.exports = _;