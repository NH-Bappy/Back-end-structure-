const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const { CustomError } = require('../utils/customError');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: { type: String, trim: true },
    slug: { type: String, unique: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
    },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "subCategory", required: false },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "brand" },

    variant: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "variant"
    }],

    discount: { type: mongoose.Schema.Types.ObjectId, ref: "discount" },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    warehouseLocation: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    image: [{}],
    tag: [String],
    manufactureCountry: String,
    rating: Number,
    warrantyInformation: String,
    warrantyClaim: { type: Boolean, default: true },
    warrantyExpires: Date,
    availabilityStatus: {
        type: String,
        enum: ["In Stock", "Out of Stock", "PreOrder"],
    },
    shippingInformation: String,
    sku: { type: String, unique: true },
    QrCode: String,
    barCode: String,
    groupUnit: { type: String, enum: ["Box", "Packet", "Dozen", "Custom"] },
    groupUnitQuantity: Number,
    unit: { type: String, enum: ["Piece", "Kg", "Gram", "Packet", "Custom"] },
    variantType: {
        type: String,
        enum: ["singleVariant", "multipleVariant"],
        required: true,
    },
    size: String,
    color: String,
    stock: Number,
    retailPrice: Number,
    retailPriceProfitAmount: Number,
    retailPriceProfitPercentage: { type: Number, max: 100 },
    wholesalePrice: Number,
    alertQuantity: Number,
    stockAlert: Boolean,
    inStock: Boolean,
    minimumOrderQuantity: Number,
    totalSale: {
        type: Number,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    
}, { timestamps: true });

// Create slug before save
productSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            replacement: "-",
            lower: true,
            strict: true,
            trim: true,
        });
    }
    next();
});

// Ensure unique slug
productSchema.pre("save", async function (next) {
    try {
        const slugExists = await this.constructor.findOne({ slug: this.slug });
        if (slugExists && slugExists._id.toString() !== this._id.toString()) {
            throw new CustomError(409, "Product name already exists");
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Update slug on name change
productSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.name) {
        update.slug = slugify(update.name, {
            replacement: "-",
            lower: true,
            strict: true,
            trim: true,
        });
        this.setUpdate(update);
    }
    next();
});

module.exports = mongoose.model("product", productSchema);
