const { uploadFileInCloudinary, removeCloudinaryFile, getPublicId } = require('../helpers/cloudinary');
const variantModel = require('../models/variant.model');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { validateVariant } = require('../validation/variant.validation');
const { apiResponse } = require('../utils/apiResponse');
const productModel = require('../models/product.model');



//@desc create new variant
exports.createNewVariant = asyncHandler(async (req, res) => {

    const data = await validateVariant(req);
    // console.log(data)

    // upload image to cloudinary
    const imageUrl = await Promise.all(
        data.images.map((singleImage) => uploadFileInCloudinary(singleImage.path))
    );
    //now save the data into database
    const variant = await variantModel.create({ ...data, image: imageUrl });
    if (!variant) throw new CustomError(401, "bed request variant not save");
    //push the variant into product model
    const pushVariant = await productModel.findOneAndUpdate(
        { _id: data.product },
        { $push: { variant: variant._id } },
        { new: true }
    )
    if (!pushVariant) throw new CustomError(404, "variant not updated into product");
    apiResponse.sendSuccess(res, 200, "variant create successfully", variant);
});

//@desc find all variant
exports.findAllVariant = asyncHandler(async (req, res) => {
    const findAll = await variantModel.find()//populate("product");
    if (!findAll) throw new CustomError(404, "something wrong with your request");
    apiResponse.sendSuccess(res, 200, "successfully found all the variant", findAll);
});

//@desc find single one
exports.findOneVariant = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(401, " The slug does not match");
    // console.log(slug);
    const singleVariant = await variantModel.findOne({}).populate("product");
    // console.log(singleVariant);
    if (!singleVariant) throw new CustomError(404, "variant not found");
    apiResponse.sendSuccess(res, 200, "variant found successfully", singleVariant);
});

//desc update variant



















//@desc delete variant
exports.deleteVariant = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    // console.log(slug)
    // return
    if (!slug) throw new CustomError(400, "Slug is required");

    const variantObject = await variantModel.findOne({slug});
    // console.log(variantObject);
    // return
    if (!variantObject) throw new CustomError(404, "Variant not found");

    // delete images
    await Promise.all(
        variantObject.image.map((singlePicture) => 
            removeCloudinaryFile(getPublicId(singlePicture))
        )
    );

    // delete variant
    const deleteVariant = await variantModel.findOneAndDelete({ slug });
    // console.log(deleteVariant)
    // return
    if (!deleteVariant) throw new CustomError(404, "Variant not found");

    // update product
    const updateProduct = await productModel.findOneAndUpdate(
        { _id: deleteVariant.product },
        { $pull: { variants: deleteVariant._id } },
        { new: true }
    );
    if (!updateProduct) throw new CustomError(400, "Failed to update product");

    apiResponse.sendSuccess(res, 200, "Variant has been deleted successfully", deleteVariant);
});
