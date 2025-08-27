const mongoose = require('mongoose');
const { types, Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { customError } = require('../utils/customError');

const userSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, "email missing"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "password missing"],
        trim: true
    },
    phoneNumber: {
        type: Number,
        required: [true, "password missing"],
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneNumberVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: mongoose.Types.ObjectId,
        ref: "Role"
    },
    permission: {
        type: mongoose.Types.ObjectId,
        ref: "permission"
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    district: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        default: "Bangladesh",
    },
    zipCode: {
        type: Number,
        trim: true,
    },
    dateOfBirth: {
        type: Date,
        trim: true,
    },
    gender: {
        type: Date,
        enum: ["male", "female", "custom"],
    },
    cart: {
        type: mongoose.Types.ObjectId,
        ref: "product",
    },
    wishList: {
        type: mongoose.Types.ObjectId,
        ref: "product",
    },
    newsLetterSubscribe: {
        type: Boolean,
        default: false
    },
    resetPasswordOTP: Number,
    resetPasswordExpires: Date,
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    lastLogin: Date,
    lastLogout: Date,
    oauth: Boolean,
    refreshToken: String,
}, {
    timestamps: true
});


// make a hash password
userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        const hashPass = await bcrypt.hash(this.password, 10)
        this.password = hashPass
    }
    next()
})

// compare password
userSchema.methods.comparePassword = async function (humanPass) {
    return await bcrypt.compare(humanPass, this.password);
}

//generate access Token
userSchema.method.generateAccessToken = async function () {
    return await jwt.sign({
        userId: this._id,
        email: this.email,
        name: this.name,
        role: this.role
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE })

}

//generate refresh Token
userSchema.method.generateRefreshToke = async function () {
    return await jwt.sign({
        userId: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE })
}

// verify accessToken 
userSchema.method.verifyAccessToken = async function (token) {
    const isValidAccessToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (!isValidAccessToken) {
        throw new customError(401, "your token is Invalid")
    }
}

// verify refresh token

userSchema.method.verifyRefreshToken = async function (token) {
    const isValidRefreshToken = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    if(!isValidRefreshToken){
        throw new customError(401 , "your refresh token is Invalid")
    }
}


module.exports = mongoose.model('User', userSchema);