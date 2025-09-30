const { uploadFileInCloudinary } = require('../helpers/cloudinary');
const variantModel = require('../models/variant.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { validateVariant } = require('../validation/variant.validation');
const { apiResponse } = require('../utils/apiResponse');
const productModel = require('../models/product.model');



//@desc create new variant
exports.createNewVariant = asyncHandler(async (req ,res) => {

    const data = await validateVariant(req);
    // console.log(data)
    
    // upload image to cloudinary
    const imageUrl = await Promise.all(
        data.images.map((singleImage) => uploadFileInCloudinary(singleImage.path))
    );
    //now save the data into database
    const variant = await variantModel.create({...data ,image: imageUrl});
    if(!variant) throw new CustomError(401 , "bed request variant not save");
    //push the variant into product model
    const pushVariant = await productModel.findOneAndUpdate(
        {_id: data.product} ,
        {$push: { variant: variant._id } },
        {new : true}
    )
    if(!pushVariant) throw new CustomError(404 , "variant not updated into product");
    apiResponse.sendSuccess(res, 200, "variant create successfully" , variant);
});

//@desc find all variant
exports.findAllVariant = asyncHandler(async (req ,res) => {
    const findAll = await variantModel.find()//populate("product");
    if(!findAll) throw new CustomError(404 , "something wrong with your request");
    apiResponse.sendSuccess(res ,200 ,"successfully found all the variant" , findAll);
});