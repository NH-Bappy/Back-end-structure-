const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const { CustomError } = require('../utils/customError');



const variantSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    size: {
        type: String,
        default: "N/A",
    },
    color: {
        type: String,
        default: "N/A",
    },
    stockVariant: {
        type: Number,
        required: true,
        min: 0,
    },
    alertVariantStock: {
        type: Number,
        default: 5,
        min: 0,
    },
    retailPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    wholesalePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    image: [
        {
            type: String,
        }
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
},
    { timestamps: true }
);

//@desc Generate a slug using name
variantSchema.pre("save", function (next) {   // Pre-save middleware runs before saving a document
    if (this.isModified("name")) {                // Only run if "name" field is new/changed
        this.slug = slugify(this.name, {          // Generate slug from the "name" value
            replacement: "-",                     // Replace spaces with dashes
            lower: true,                          // Convert slug to lowercase
            strict: true,                         // Remove special characters
            trim: true,                           // Trim extra spaces from start/end
        });
    }
    next();                                       // Continue with the save operation
});


//@desc check slug exit or not

variantSchema.pre("save", async function (next) {              // Pre-save middleware (runs before saving a document)
    try {
        const slugExists = await this.constructor.findOne({ slug: this.slug }); // Find if another document already has the same slug
        if (slugExists && slugExists._id.toString() !== this._id.toString()) {  // If slug exists and it's not the same document
            throw new CustomError(401, "Variant name already exists");         // Throw custom error to prevent duplicate slugs
        }

        next();                                                                 // Continue saving if no duplicate found
    }
    catch (error) {
        next(error);                                                            // Pass error to error handler if something goes wrong
    }
});






//@desc update slug 
variantSchema.pre("findOneAndUpdate", function (next) {   // Middleware runs before "findOneAndUpdate"
    const update = this.getUpdate();                            // Get the update object (fields being updated)

    if (update.name) {                                          // If "name" is being updated
        update.slug = slugify(update.name, {                      // Generate new slug from the updated "name"
            replacement: "-",                                       // Replace spaces with dashes
            lower: true,                                            // Convert slug to lowercase
            strict: true,                                          // Allow special characters (set to true to remove)
            trim: true,                                             // Trim spaces from start/end
        });

        this.setUpdate(update);                                   // Apply the updated object back to the query
    }

    next();                                                     // Continue with the update operation
});



module.exports = mongoose.models.variant || mongoose.model("variant", variantSchema);