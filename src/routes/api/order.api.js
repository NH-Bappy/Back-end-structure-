const express = require('express');
const _ = express.Router();
const orderController = require('../../controller/order.controller');


_.route("/create-order").post(orderController.createOrder);
_.route("/get-all-Order").get(orderController.getallOrder);
_.route("/get-all-status").get(orderController.allStatus);
_.route("/update-order/:id").put(orderController.updateOrder);
_.route("/Courier-Pending").get(orderController.CourierPending)


module.exports = _;