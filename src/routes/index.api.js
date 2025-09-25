const express = require('express');
const _ = express.Router();



_.use("/auth", require('../routes/api/user.api'));
_.use("/category" , require('../routes/api/category.api'));
_.use("/subcategory" , require('../routes/api/subCategory.api'));
_.use("/brand" , require('../routes/api/brand.api'));
_.use("/discount" , require('../routes/api/discount.api'));
_.use("/product" ,require('../routes/api/product.api'));





module.exports = _;

