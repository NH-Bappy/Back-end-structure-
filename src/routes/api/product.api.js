const express = require('express');
const _ = express.Router();
const productController = require('../../controller/product.controller')
const upload = require("../../middleware/multer.middleware");




_.route("/Add-product").post(upload.fields([{name:"image" ,maxCount: 10}]),productController.CreateNewProduct);
_.route("/find-all-product").get(productController.showAllProduct);
_.route("/find-Single-Product/:slug").get(productController.findSingleProduct);
_.route("/update-product-info/:slug").put(productController.updateProductInformation);
_.route("/upload-product-image/:slug").put(upload.fields([{name:"image" ,maxCount:10}]),productController.updateProductImage);
_.route("/product-image-delete/:slug").delete(productController.deleteProductImage);


module.exports = _;