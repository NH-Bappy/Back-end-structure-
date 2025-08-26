const mongoose = require('mongoose');
const {types , Schema} = mongoose;

const userSchema = new Schema({
    name:{
        type: String,
        trim: true
    },
    email:{
        type: String,
        required:[true, "email missing"],
        unique:true,
        trim: true
    },
    password:{
        type: String,
        required:[true, "password missing"],
        trim: true
    },
    phoneNumber:{
        type: Number,
        required:[true, "password missing"],
        trim: true
    },
    image:{
        type: String,
        trim: true
    },
    emailVerified:{
        type: Boolean,
        default: false
    },
    phoneNumberVerified:{
        type: Boolean,
        default:false
    },
    role:{
        type: mongoose.Types.ObjectId,
        ref:"Role"
    },
    permission:{
        type: mongoose.Types.ObjectId,
        ref:"permission"
    },
    address:{
        type: String,
        trim: true
    },
    city:{
        type: String,
        trim: true
    },
    district:{
        type: String,
        trim: true,
    },
    country:{
        type: String,
        default: "Bangladesh",
    },
    zipCode:{
        type: Number,
        trim: true,
    },
    dateOfBirth:{
        type: Date,
        trim: true,
    },
    gender:{
        type: Date,
        enum: ["male" , "female" ,"custom"],
    },
    cart:{
        type: mongoose.Types.ObjectId,
        ref: "product",
    },
    wishList:{
        type: mongoose.Types.ObjectId,
        ref: "product",
    },
    newsLetterSubscribe:{
        type: Boolean,
        default: false
    },
    resetPasswordOTP:Number,
    resetPasswordExpires: Date,
    twoFactorEnabled:{
        type: Boolean,
        default: false,
    },
    isBlocked:{
        type: Boolean,
        default: false,
    },
    isActive:{
        type: Boolean,
        default: false,
    },
    lastLogin: Date,
    lastLogout: Date,
    oauth: Boolean,
    refreshToken:String,
});

module.exports = mongoose.model('User' , userSchema);