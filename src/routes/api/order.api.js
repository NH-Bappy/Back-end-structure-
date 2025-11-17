const express = require('express');
const _ = express.Router();
const orderController = require('../../controller/order.controller');


_.route("/create-order").post(orderController.createOrder);
_.route("/get-all-Order").get(orderController.getallOrder);
_.route("/get-all-status").get(orderController.allStatus)


module.exports = _;