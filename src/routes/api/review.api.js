const express = require('express');
const _ = express.Router();
const reviewController = require('../../controller/review.controller');


_.route("/create-review").post(reviewController.createReview);
_.route("/find-all-review").get(reviewController.getAllReview);



module.exports = _;