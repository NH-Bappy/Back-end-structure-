const express = require('express');
const _ = express.Router();
const subcategoryController = require('../../controller/subcategory.controller')
_.route("/create-subcategory").post(subcategoryController.createNewSubCategory);
_.route("/find-all-subcategory").get(subcategoryController.findAllSubcategories);
_.route("/request-subcategory/:slug").get(subcategoryController.getSubcategoryBySlug);

module.exports = _;