const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const { CustomError } = require('../utils/customError');


const couponSchema = new mongoose.Schema({
    slug: String,
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    expireAt: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: 50,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'tk'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
},
    { timestamps: true }
);

// Create slug before save
couponSchema.pre("save", function (next) {
    if (this.isModified("code")) {
        this.slug = slugify(this.code, {
            replacement: "-",
            lower: true,
            strict: true,
            trim: true,
        });
    }
    next()
});
// Ensure unique slug
couponSchema.pre("save", async function (next) {
    try {
        const slugExists = await this.constructor.findOne({ slug: this.slug });
        if (slugExists && slugExists._id.toString() !== this._id.toString()) {
            throw new CustomError(409, "Coupon code already exists")
        }
        next()
    } catch (error) {
        next(error)
    }
});

// Update slug on name change
couponSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.code) {
        update.slug = slugify(update.code, {
            replacement: "-",
            lower: true,
            strict: true,
            trim: true,
        })
        this.setUpdate(update);
    }
    next()
});

module.exports = mongoose.model("coupon" , couponSchema)