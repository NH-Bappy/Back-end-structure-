const discountModel = require('../models/discount.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { validateDiscount } = require('../validation/discount.validation');




//@desc create discount

exports.newDiscountCreate = asyncHandler(async (req , res) => {
    const data = await validateDiscount(req);
    // console.log(data)
    // now save the object into mongoDB

      // Create a new subcategory document in the database using the validated values
    const discountObject = await discountModel.create({...data}); // newly created subcategory object




});