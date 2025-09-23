const mongoose = require('mongoose');
const { Schema } = mongoose;
const { CustomError } = require('../utils/customError');

const warehouseSchema = new Schema({
    wareHouseName: {
        type: String,
        required: [true, "Warehouse name required!!"],
        trim: true,
        unique: true,  // DB-level uniqueness
    },
    warehouseLocation: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

// Ensure unique name at application level
warehouseSchema.pre("save", async function (next) {
    try {
        const existingWarehouse = await this.constructor.findOne({ wareHouseName: this.wareHouseName });
        if (existingWarehouse && existingWarehouse._id.toString() !== this._id.toString()) {
            throw new CustomError(409, "Warehouse name already exists");
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("Warehouse", warehouseSchema);
