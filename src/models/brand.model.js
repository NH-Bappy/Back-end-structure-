const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config();
const { CustomError } = require("../utils/customError");
const slugify = require('slugify');

// ----------------------
// Brand Schema
// ----------------------
const brandSchema = new Schema({
    name: {
        type: String,
        required: true,   // brand must have a name
        trim: true,       // remove spaces from start & end
    },
    image: {
        type: String,     // image URL or path
        required: true,
    },
    slug: {
        type: String,
    },
    subcategory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory" // relation with SubCategory model
        }
    ],
    since: {
        type: Number,
        require: true
    },
    isActive: {
        type: Boolean,
        default: true,    // default active brand
    },
}, 
    { timestamps: true }
); // adds createdAt & updatedAt automatically

// ----------------------
// Pre-save middleware: generate slug
// ----------------------
// Runs before saving a brand document.
// Only generate slug if 'name' is new/modified.
brandSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            replacement: "-",   // replace spaces with -
            lower: true,        // convert to lowercase
            strict: true,       // remove special characters
            trim: true          // remove - from start & end
        });
    }
    next();
});

// ----------------------
// Pre-save middleware: check slug uniqueness
// ----------------------
// Ensures no two brands have the same slug.
// If another document with same slug exists and it’s not this one → throw error.
brandSchema.pre("save", async function (next) {
    try {
        const slugExists = await this.constructor.findOne({ slug: this.slug });

        if (slugExists && slugExists._id.toString() !== this._id.toString()) {
            throw new CustomError(409, "Brand name already exists");
        }

        next();
    } catch (err) {
        next(err); // pass error to mongoose
    }
});

// ----------------------
// Export Model
// ----------------------
module.exports = mongoose.model("Brand", brandSchema);
