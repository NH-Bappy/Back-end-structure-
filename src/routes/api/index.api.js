const express = require('express');
const _ = express.Router();



_.use("/auth", require('./user.api'));
_.use("/category" , require('./category.api'));
_.use("/subcategory" , require('./subCategory.api'))





module.exports = _;

