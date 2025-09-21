const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const { CustomError } = require('../utils/customError');
const { Schema } = mongoose;

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    discount: {
        type: mongoose.Types.ObjectId,
        ref: "discount",
    },
    isActive: {
        type: Boolean
    }
},
    {
        timestamps: true
    }
);

// make a slug using name
subCategorySchema.pre("save", function (next) {   // Pre-save middleware runs before saving a document
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






// update slug name

subCategorySchema.pre("findOneAndUpdate", function (next) {   // Middleware runs before "findOneAndUpdate"
    const update = this.getUpdate();                            // Get the update object (fields being updated)

    if (update.name) {                                          // If "name" is being updated
        update.slug = slugify(update.name, {                      // Generate new slug from the updated "name"
            replacement: "-",                                       // Replace spaces with dashes
            lower: true,                                            // Convert slug to lowercase
            strict: false,                                          // Allow special characters (set to true to remove)
            trim: true,                                             // Trim spaces from start/end
        });

        this.setUpdate(update);                                   // Apply the updated object back to the query
    }

    next();                                                     // Continue with the update operation
});

// check slug exit or not
subCategorySchema.pre("save", async function (next) {              // Pre-save middleware (runs before saving a document)
    try {
        const slugExists = await this.constructor.findOne({ slug: this.slug }); // Find if another document already has the same slug
        if (slugExists && slugExists._id.toString() !== this._id.toString()) {  // If slug exists and it's not the same document
            throw new CustomError(401, "subCategory name already exists");         // Throw custom error to prevent duplicate slugs
        }

        next();                                                                 // Continue saving if no duplicate found
    }
    catch (error) {
        next(error);                                                            // Pass error to error handler if something goes wrong
    }
});


module.exports = mongoose.models.subCategory || mongoose.model("subCategory", subCategorySchema);









