const express = require('express');
const _ = express.Router();
const categoryController = require('../../controller/category.controller');
const upload = require('../../middleware/multer.middleware');

_.route("/create-category").post(upload.fields([{name: "image" , maxCount:1}]),categoryController.newCategory)


module.exports = _;