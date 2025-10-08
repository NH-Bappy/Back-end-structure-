const express = require('express');
const _ = express.Router();
const variantController = require('../../controller/variant-controller');
const upload = require('../../middleware/multer.middleware');

_.route("/create-new-variant").post(upload.fields([{name: "image" ,maxCount: 10}]) ,variantController.createNewVariant);
_.route("/find-all").get(variantController.findAllVariant);
_.route("/find-one/:slug").get(variantController.findOneVariant);
_.route("/update-variant/:slug").put(upload.fields([{name: "image" ,maxCount: 10}]), variantController.updateVariantInformation);
_.route("/variant-image-update/:slug").put(upload.fields([{name: "image" ,maxCount: 10}]) ,variantController.updateVariantImage);
_.route("/variant-image-delete/:slug").delete(variantController.deleteVariantImage);
_.route("/delete-variant/:slug").delete(variantController.deleteVariant);


module.exports = _ ;