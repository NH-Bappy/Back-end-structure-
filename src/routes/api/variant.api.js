const express = require('express');
const _ = express.Router();
const variantController = require('../../controller/variant-controller');
const upload = require('../../middleware/multer.middleware');

_.route("/create-new-variant").post(upload.fields([{name: "image" ,maxCount: 10}]) ,variantController.createNewVariant);



module.exports = _;