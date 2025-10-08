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
    apiResponse.sendSuccess(res, 201, "variant create successfully", variant);
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


//@desc update variant

exports.updateVariantInformation = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(400, "slug is missing");
    const value = req.body;
    // console.log(value);

    /**| Loop Type  | Works On                   | Iterates Over             | Example                     |
    | ---------- | -------------------------- | ------------------------- | --------------------------- |
    | `for...in` | Objects                    | **Keys** (property names) | `{ name: "A", price: 200 }` |
    | `for...of` | Arrays, Strings, Iterables ,sets ,maps  | **Values**                | `[10, 20, 30]`, `"abc"`     |
     */
    for (let postmanFields in value) {
        if (value[postmanFields] == null || value[postmanFields] === "") {
            throw new CustomError(400, `${postmanFields} is missing`);
        }
    }

    const variantObject = await variantModel.findOne({ slug });
    if (!variantObject) throw new CustomError(404, "variant is missing");

    // Check if product reference has changed
    //It checks whether the variant’s product field has been changed in the update request.
    //value.product = This is the product ID sent in your request body (e.g. when updating a variant).
    //variantObject.product = This is the product ID currently stored in the database for that variant.

    const isProductChanged = value.product && value.product.toString() !== variantObject.product.toString();
    if (isProductChanged) {
        //Remove variant from old 
        await productModel.findOneAndUpdate({ _id: variantObject.product }, { $pull: { variant: variantObject._id } });
        // Add variant to new product
        await productModel.findOneAndUpdate({ _id: value.product }, { $push: { variant: variantObject._id } });
    };

    // Update variant info
    const updatedVariant = await variantModel.findOneAndUpdate(
        { slug },
        { ...value },
        { new: true }
    );

    if (!updatedVariant) throw new CustomError(304, "update unsuccessful");

    apiResponse.sendSuccess(res, 200, "Variant info updated successfully", updatedVariant);
});

//@ update image without information
exports.updateVariantImage = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(400, "slug is missing");

    const variantObject = await variantModel.findOne({ slug });
    if (!variantObject) throw new CustomError(404, "variant not found");
    // console.log(variantObject)

 // Check uploaded files
    if (!req.files || !req.files.image) {
        throw new CustomError(400, "No image files provided");
    }

    // console.log(req.files); this thing came from multer

    // upload image into cloudinary 
    const imageUrl = await Promise.all(
        // req.files.image.map((singleImage) => console.log(singleImage.path))
        req.files.image.map((singleImage) => uploadFileInCloudinary(singleImage.path))
    );

    // Save uploaded URLs to variant document
    variantObject.image.push(...imageUrl);
    await variantObject.save()
    apiResponse.sendSuccess(res , 200 , "variant image update successfully",variantObject);
});

//@ delete variant image
exports.deleteVariantImage = asyncHandler(async(req , res) => {
    
});














//@desc delete variant
exports.deleteVariant = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    // console.log(slug)
    // return
    if (!slug) throw new CustomError(400, "Slug is required");

    const variantObject = await variantModel.findOne({ slug });
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
