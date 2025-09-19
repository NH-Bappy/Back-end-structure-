require('dotenv').config();
const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const { CustomError } = require('../utils/customError');
const { Schema } = mongoose;


const discountSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    },
    discountValueByAmount: {
        type: Number,
        default: 0
    },
    discountValueByPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    discountType: {
        type: String,
        required: true,
        enum: ['tk', 'percentage']
    },
    discountPlan: {
        type: String,
        required: true,
        enum: ["flat", "category", "product", "subcategory"]
    },
    discountValidFrom: {
        type: Date,
        required: true,
    },
    discountValidTo: {
        type: Date,
        required: true,
    },
    targetProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    targetCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    targetSubcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcategory'
    },
    isActive: {
        type: Boolean,
        default: true
    },
},
    { timestamps: true }
);

// make a slug using name , Generate slug before save

discountSchema.pre('save', function (next) {
    // Only generate slug if 'name' was created/modified
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            replacement: "-",   // replace spaces with -
            lower: true,        // convert to lowercase
            strict: true,       // remove special characters
            trim: true          // trim - from start & end
        });
    }
    next()
});

// Ensure unique slug check slug exist or not

discountSchema.pre("save", async function (next) {
    try {
        //this.constructor = the Model (Category).
        const slugExists = await this.constructor.findOne({ slug: this.slug });
        // if found and it's not the same document → duplicate
        if (slugExists && slugExists._id.toString() !== this._id.toString()) {
            //If another category with the same slug already exists and it’s not me, then stop and throw an error. Otherwise, let me save.
            throw new CustomError(409, "discount name already exists");
        }
        next()
    } catch (error) {
        next(error)
    }
});

// update slug name
discountSchema.pre('findOneAndUpdate', function (next) {   // Middleware runs before "findOneAndUpdate"
    const update = this.getUpdate();                       // Get the update object (fields being updated)

    if (update.name) {                                     // If "name" is being updated
        update.slug = slugify(update.name, {               // Generate new slug from the updated "name"
            replacement: "-",                              // Replace spaces with dashes
            lower: true,                                   // Convert slug to lowercase
            strict: false,                                 // Allow special characters (set to true to remove)
            trim: true,                                    // Trim spaces from start/end
        });

        this.setUpdate(update);                            // Apply the updated object back to the query
    }

    next();  // Continue with the update operation
});





module.exports = mongoose.model.discount || mongoose.model("discount", discountSchema);