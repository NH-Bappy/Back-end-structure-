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
    const { ptype } = req.query;
    let queryObject = {};

    if (ptype === "single") {
        queryObject.variantType = "singleVariant";
    } else if (ptype === "multiple") {
        queryObject.variantType = "multipleVariant";
    } else {
        // If ptype is not provided, match both types
        queryObject.variantType = { $in: ["singleVariant", "multipleVariant"] }; //$in is a query operator that matches any value in an array.
    }



    const findAllProduct = await productModel.find(queryObject).populate({ path: "category subCategory brand discount", }).sort({ createdAt: -1 }).select("-QrCode -barCode");

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

//@desc [update] delete product image
exports.deleteProductImage = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { imageId } = req.body;
    if (!slug && !imageId.length) throw new CustomError(400, "slug and imageId is missing");
    // console.log(imageId);
    // getPublicId(imageId)
    // return
    const productObject = await productModel.findOne({ slug });
    if (!productObject) throw new CustomError(404, "The product you are looking for does not exist");
    // console.log(imageId);
    const deleteImage = productObject.image.filter((img) => img !== imageId);
    // console.log(deleteImage)
    const public_id = getPublicId(imageId);
    await removeCloudinaryFile(public_id);
    productObject.image = deleteImage;
    await productObject.save();
    apiResponse.sendSuccess(res, 200, "image delete successfully", productObject);
});



//@delete product
exports.deleteProduct = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(400, "slug is missing");

    const productObject = await productModel.findOne({ slug });
    if (!productObject) throw new CustomError(400, "The product you are looking for does not exist");

    for (let singleImage of productObject.image) {
        const public_id = getPublicId(singleImage);
        await removeCloudinaryFile(public_id);
    }

    const deleteProduct = await productModel.findOneAndDelete({ slug });
    if (!deleteProduct) throw new CustomError(400, "The product you are looking for does not exist");

    apiResponse.sendSuccess(res, 200, "product deleted successfully", deleteProduct);
});

//@desc search product  with query;
exports.searchProductWithQuery = asyncHandler(async (req, res) => {
    // console.log(req.query);
    const { category, subCategory, Brand, tag } = req.query;
    const query = {};
    if (category) {
        query.category = category;
    }
    if (subCategory) {
        query.subCategory = subCategory;
    }
    if (Brand) {
        if (Array.isArray(Brand)) {
            query.Brand = { $in: Brand };//Special handling for Brand: if multiple brands are passed, it uses $in for matching any of them
        } else {
            query.Brand = Brand;
        }
    }
    if (tag) {
        if (Array.isArray(tag)) {
            query.tag = { $in: tag };//Special handling for Brand: if multiple brands are passed, it uses $in for matching any of them
        } else {
            query.tag = tag;
        }
    }

    const productQuery = await productModel.find(query).populate({ path: "category subCategory Brand", });
    if (!productQuery.length) {
        throw new CustomError(400, "The product you are looking for does not exist")
    };
    apiResponse.sendSuccess(res, 200, "found the item successfully", productQuery)
});

// product page pagination
exports.productPagePagination = asyncHandler(async (req, res) => {
    const { page, item } = req.query;
    const PageNumber = parseInt(page, 10);
    const itemNumber = parseInt(item, 10);
    if (!PageNumber || !itemNumber)
        throw new CustomError(401, "pageNumber or item number not found!");
    const skip = (PageNumber - 1) * itemNumber;
    const allProduct = await productModel.countDocuments();
    const totalPage = Math.round(allProduct / item);

    const productObject = await productModel.find().skip(skip).limit(itemNumber).populate({ path: "category subCategory Brand", });
    if (!productObject || productObject.length === 0)
        throw new CustomError(401, "product not found !! ");
    apiResponse.sendSuccess(res, 200, "found the item successfully", { ...productObject, totalPage, allProduct });
});

//@desc search with price range minimum and maximum api
exports.priceRangeSearch = asyncHandler(async (req, res) => {
    const { minimumPrice, maximumPrice } = req.query;
    // console.log(minimumPrice, maximumPrice)
    // return

    if (!minimumPrice && !maximumPrice) {
        throw new CustomError(401, "missing minimum Price and maximum price")
    };

    // Convert query params (string) to numbers
    const min = minimumPrice ? Number(minimumPrice) : null;
    const max = maximumPrice ? Number(maximumPrice) : null;

    // $gte = greater than or equal to
    // $lte = less than or equal to
    let query;
    if (min && max) {
        query = { $gte: min, $lte: max };
    } else if (min) {
        query = { $gte: min }
    } else if (max) {
        query = { $lte: max }
    };

    // const productObject = await productModel.find({ retailPrice: { $gte: min, $lte: max } });
    const productObject = await productModel
        .find({ retailPrice: query })
        .populate({ path: "category subCategory Brand", })
        .sort({ createdAt: -1 });

    if (!productObject.length) throw new CustomError(401, "Product not found !!");
    apiResponse.sendSuccess(res, 200, "product found successfully ", productObject);
});

// search product order
exports.getSortedProducts = asyncHandler(async (req, res) => {
    const { sort_by } = req.query;

    // If query is missing, throw error
    if (!sort_by) throw new CustomError(400, "query is missing");

    let sortQuery = {};

    // Handle different sorting options
    if (sort_by === "date-descending") {
        // Newest first
        sortQuery = { createdAt: -1 };
    } else if (sort_by === "date-ascending") {
        // Oldest first
        sortQuery = { createdAt: 1 };
    } else if (sort_by === "price-descending") {
        // Highest price first
        sortQuery = { retailPrice: -1 };
    } else if (sort_by === "price-ascending") {
        // Lowest price first
        sortQuery = { retailPrice: 1 }; //fixed from createdAt
    } else if (sort_by === "name-descending") {
        // Z → A
        sortQuery = { name: -1 };
    } else if (sort_by === "name-ascending") {
        // A → Z
        sortQuery = { name: 1 };
    }

    // Fetch products from DB with sorting
    const productObject = await productModel.find({}).sort(sortQuery);

    // If no products found, throw error
    if (!productObject.length) throw new CustomError(404, "there is no product to find");
    apiResponse.sendSuccess(
        res,
        200,
        "successfully find all product",
        productObject
    );
});


//@desc product active or inactive
// Controller to change a product's active/inactive state
exports.changeProductState = asyncHandler(async (req, res) => {
    // Extract slug and state from query parameters
    // Example request: /api/v1/product/active-mode?slug=AppleSmartphone&state=inactive
    const { slug, state } = req.query;

    // Validate required query params (both slug and state must be provided)
    if (!slug || !state) {
        throw new CustomError(400, "slug or state is missing");
    }

    // Validate allowed state values (only "active" or "inactive" are acceptable)
    if (!["active", "inactive"].includes(state)) {
        throw new CustomError(400, "invalid state value, must be 'active' or 'inactive'");
    }

    // Try to find the product by its slug
    const productObject = await productModel.findOne({ slug });
    if (!productObject) {
        throw new CustomError(404, "the product is missing");
    }

    // Update the product's isActive field based on the state
    // If state === "active", set isActive = true
    // If state === "inactive", set isActive = false
    productObject.isActive = state === "active";

    // Save changes to the database
    await productObject.save();

    // Send success response with updated product data
    apiResponse.sendSuccess(res, 200, "successfully changed the state", productObject);
});
