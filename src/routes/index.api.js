const express = require('express');
const _ = express.Router();



_.use("/auth", require('../routes/api/user.api'));
_.use("/category" , require('../routes/api/category.api'));
_.use("/subcategory" , require('../routes/api/subCategory.api'));
_.use("/brand" , require('../routes/api/brand.api'));
_.use("/discount" , require('../routes/api/discount.api'));
_.use("/product" ,require('../routes/api/product.api'));
_.use("/variant" ,require('../routes/api/variant.api'));
_.use("/coupon" ,require("../routes/api/coupon.api"));
_.use("/review" ,require('../routes/api/review.api'));
_.use("/cart" ,require('../routes/api/cart.api'));
_.use("/deliveryCharge" ,require('../routes/api/delivery.api'));
_.use("/order" ,require('../routes/api/order.api'));




module.exports = _;

