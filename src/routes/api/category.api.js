const express = require('express');
const _ = express.Router();
const categoryController = require('../../controller/category.controller');
const upload = require('../../middleware/multer.middleware');

_.route("/create-category").post(upload.fields([{name: "image" , maxCount:1}]),categoryController.newCategory)
_.route("/find-all-category").get(categoryController.findAllCategories);
_.route("/specific-category/:slug").get(categoryController.getCategoryBySlug);
_.route("/edit-category/:slug").put(upload.fields([{name: "image" , maxCount:1}]),categoryController.modifyCategory)
_.route("/remove-category/:slug").delete(categoryController.removeCategory);

module.exports = _;