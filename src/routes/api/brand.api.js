const express = require('express');
const _ = express.Router();
const brandController = require('../../controller/brand.controller');
const upload = require('../../middleware/multer.middleware');

_.route("/add-brand").post(upload.fields([{name: "image" , maxCount: 1}]), brandController.registerBrand);
_.route("/all-brand").get(brandController.findAllBrand);

module.exports = _;