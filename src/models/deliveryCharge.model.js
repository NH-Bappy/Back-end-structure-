const mongoose = require('mongoose');
const { CustomError } = require('../utils/customError');
const { default: slugify } = require('slugify');

const deliveryChargeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
        },
        amount: {
            type: Number,
            min: 0,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// generate slug before save
deliveryChargeSchema.pre("save", function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, {
            replacement: '-',
            lower: true,
            strict: false,
            trim: true,
        });
    }
    next();
});

// Check unique slug
deliveryChargeSchema.pre('save', async function (next) {
    const slug = await this.constructor.findOne({ slug: this.slug });
    if (slug && slug._id.toString() !== this._id.toString()) {
        throw new CustomError(401, 'DeliveryCharge name already exists');
    }
    next();
});


deliveryChargeSchema.pre('findOneAndUpdate', function (next) {   // Middleware runs before "findOneAndUpdate"
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



module.exports = mongoose.models.DeliveryCharge || mongoose.model('DeliveryCharge', deliveryChargeSchema);
