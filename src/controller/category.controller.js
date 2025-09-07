const categoryModel = require('./category.controller');
const {validateCategory} = require('../validation/category.validation');
const {asyncHandler} = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');


exports.newCategory = asyncHandler(async (req,res) => {
    const value = await validateCategory(req);
    console.log(value)
})