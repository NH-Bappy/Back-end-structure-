const { uploadFileInCloudinary } = require('../helpers/cloudinary');
const { generateQR, generateBarcode } = require('../helpers/qrcode.barcode');
const productModel = require('../models/product.model');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { CustomError } = require('../utils/customError');
const { validateProduct } = require('../validation/Product.validation');



//@desc create new product

exports.CreateNewProduct = asyncHandler(async(req ,res) => {
    const data = await validateProduct(req);
    // console.log(data)
    // upload image to cloudinary
    const {image} = data;
    const allImageLink = [];
    for(let oneImage of image){
        const singleImagePath = await uploadFileInCloudinary(oneImage.path);
        // console.log(singleImagePath);
        allImageLink.push(singleImagePath);
    };

    // upload to database

    const productObject = await productModel.create({ ...data,image: allImageLink});
    // console.log(productObject);
    if(!productObject) throw new CustomError(400 , "something wrong with your product");
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
    apiResponse.sendSuccess(res , 200 ,"product created successfully" , productObject);
});


