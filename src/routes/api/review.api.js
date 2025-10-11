const express = require('express');
const _ = express.Router();
const reviewController = require('../../controller/review.controller');


_.route("/create-review").post(reviewController.createReview)



module.exports = _;