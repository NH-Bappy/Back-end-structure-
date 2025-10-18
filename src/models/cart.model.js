const mongoose = require('mongoose');



const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    guestID: {
        type: String,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                default: null,
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "variant",
                default: null,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
                min: 1,
            },
            unitTotalPrice: {
                type: Number,
                required: true,
                min: 0,
            },
            size: {
                type: String,
                trim: true,
                required: true,
            },
            color: {
                type: String,
                trim: true,
                required: true,
            },
        },
    ],
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "coupon",
        default: null,
    },
    totalAmount: Number,
    totalQuantity: Number,
    totalProduct : Number,
    discountAmount: {
        type: Number,
        min: 0,
        default: 0,
    },
    discountType: {
        type: String,
    },
    totalAmountOfWholeProduct: {
        type: Number,
        required: false,
        min: 0,
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);


