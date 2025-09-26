const { uploadFileInCloudinary, getPublicId, removeCloudinaryFile } = require('../helpers/cloudinary');
const { generateQR, generateBarcode } = require('../helpers/qrcode.barcode');
const productModel = require('../models/product.model');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { validateProduct } = require('../validation/Product.validation');



//@desc create new product

exports.CreateNewProduct = asyncHandler(async (req, res) => {
    const data = await validateProduct(req);
    // console.log(data)
    // upload image to cloudinary
    const { image } = data;
    const allImageLink = [];
    for (let oneImage of image) {
        const singleImagePath = await uploadFileInCloudinary(oneImage.path);
        // console.log(singleImagePath);
        allImageLink.push(singleImagePath);
    };

    // upload to database

    const productObject = await productModel.create({ ...data, image: allImageLink });
    // console.log(productObject);
    if (!productObject) throw new CustomError(400, "something wrong with your product");
    //QRCode link www.front-end.com/product/${product.slug}
    const QRCodeLink = `https://istockbd.com/collections/ipad-pro-price-in-bd/products/ipad-pro-m4-13-inch-price-in-bd`;

    // make a QRCode with this link
    const QRCode = await generateQR(QRCodeLink);

    // make a bar code
    const barCode = await generateBarcode(productObject.sku);
    //now update the product
    productObject.QrCode = QRCode;
    productObject.barCode = barCode;
    await productObject.save()
    apiResponse.sendSuccess(res, 200, "product created successfully", productObject);
});


//@desc get all product

exports.showAllProduct = asyncHandler(async (req, res) => {
    const findAllProduct = await productModel.find({}).populate({ path: "category subCategory Brand discount", }).sort({ createdAt: -1 });
    if (!findAllProduct.length) throw new CustomError(400, "find product failed");
    apiResponse.sendSuccess(res, 200, "all product found successfully", findAllProduct);
});

//@desc get single product
exports.findSingleProduct = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(400, "slug is missing");
    const singleProduct = await productModel.findOne({ slug }).populate({ path: "category subCategory Brand discount", });
    if (!singleProduct) throw new CustomError(400, "single product not found");
    apiResponse.sendSuccess(res, 200, "single found successfully", singleProduct)
});


//@ update product information without image

exports.updateProductInformation = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(400, "slug is missing");
    const modifyProductInfo = await productModel.findOneAndUpdate({ slug }, { ...req.body }, { new: true });
    if (!modifyProductInfo) throw new CustomError(400, "The product you are looking for does't exist");
    apiResponse.sendSuccess(res, 200, "System successfully updated the product.", modifyProductInfo);
});

//@ update product image without information
exports.updateProductImage = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(400, "slug is missing");

    const productObject = await productModel.findOne({ slug });
    if (!productObject) throw new CustomError(400, "The product you are looking for does not exist");

    // upload image into cloudinary 
    // console.log(req.files);
    for (let singleImage of req?.files?.image) {
        const imageLink = await uploadFileInCloudinary(singleImage.path);
        productObject.image.push(imageLink);
    }

    apiResponse.sendSuccess(res, 200, "image fetch successfully", productObject);

});

//@desc delete product image
exports.deleteProductImage = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const {imageId} = req.body;
    if (!slug && !imageId.length) throw new CustomError(400, "slug and imageId is missing");
    // console.log(imageId);
    // getPublicId(imageId)
    // return
    const productObject = await productModel.findOne({ slug });
    if (!productObject) throw new CustomError(400, "The product you are looking for does not exist");
    // console.log(imageId);
    const deleteImage = productObject.image.filter((img) => img !== imageId);
    // console.log(deleteImage)
    const public_id = getPublicId(imageId);
    await removeCloudinaryFile(public_id);
    productObject.image = deleteImage;
    await productObject.save();
    apiResponse.sendSuccess(res, 200, "image delete successfully", productObject);
});