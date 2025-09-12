const express = require('express');
const _ = express.Router();



_.use("/auth", require('./user.api'));
_.use("/category" , require('./category.api'));
_.use("/subcategory" , require('./subCategory.api'));
_.use("/brand" , require('./brand.api'));





module.exports = _;

