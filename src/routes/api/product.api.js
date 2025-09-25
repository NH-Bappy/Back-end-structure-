const express = require('express');
const _ = express.Router();
const productController = require('../../controller/product.controller')
const upload = require("../../middleware/multer.middleware");



_.route("/Add-product").post(upload.fields([{name:"image" ,maxCount: 10}]),productController.CreateNewProduct);
_.route("/find-all-product").get(productController.showAllProduct);
_.route("/findSingleProduct/:slug").get(productController.findSingleProduct);




module.exports = _;