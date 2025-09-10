const express = require('express');
const _ = express.Router();
const subcategoryController = require('../../controller/subcategory.controller')
_.route("/create-subcategory").post(subcategoryController.createNewSubCategory);

module.exports = _;