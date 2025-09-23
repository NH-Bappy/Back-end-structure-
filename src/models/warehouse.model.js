const mongoose = require('mongoose');
const { Schema } = mongoose;



const warehouseSchema = new Schema({
    wareHouseName: {
        type: String,
        required: [true, "warehouse name required !! "],
        trim: true,
    },

    warehouseLocation: {
        type: String,
        required: true,
    },
},
    { timestamps: true }
);

// Ensure unique slug
warehouseSchema.pre("save", async function (next) {
    try {
        const wareHouseNameExist = await this.constructor.findOne({ wareHouseNameExist: this.wareHouseNameExist });
        if (wareHouseNameExist && wareHouseNameExist._id.toString() !== this._id.toString()) {
            throw new CustomError(409, "wareHouse name already exists");
        }
        next();
    } catch (error) {
        next(error);
    }
});


module.exports = mongoose.model("warehouseLocation" , warehouseSchema);