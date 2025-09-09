require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { apiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../utils/customError");
const { required, ref, boolean, exist } = require('joi');
const slugify = require('slugify')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String
    },
    slug: {
        type: String
    },
    subCategory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subCategory",
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
},
    { timestamps: true }
)

// make a slug using name

// Pre-save hook: runs before saving the document
categorySchema.pre("save", function (next) {
    // Only generate slug if 'name' was created/modified
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            replacement: "-",   // replace spaces with -
            lower: true,        // convert to lowercase
            strict: true,       // remove special characters
            trim: true          // trim - from start & end
        });
    }

    next(); // move to the next middleware
});

// check slug exist or not
categorySchema.pre('save', async function (next) {
    try {
        const slugExists = await this.constructor.findOne({ slug: this.slug });//this.constructor = the Model (Category).
        // if found and it's not the same document → duplicate
        if (slugExists && slugExists._id.toString() !== this._id.toString()) {
            //If another category with the same slug already exists and it’s not me, then stop and throw an error. Otherwise, let me save.
            throw new CustomError(401, "Category name already exists");
        }
        next();
    } catch (err) {
        next(err);
    }
});





module.exports = mongoose.models.category || mongoose.model("category", categorySchema)