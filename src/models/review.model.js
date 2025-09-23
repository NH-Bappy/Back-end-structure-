const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        min: [1, "Minimum rating is 1"],
        max: [5, "Maximum rating is 5"],
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
