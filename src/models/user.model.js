const mongoose = require('mongoose');
const { types, Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { CustomError } = require('../utils/customError');
const { number } = require('joi');

const userSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, "email missing"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "password missing"],
        trim: true
    },
    phoneNumber: {
        type: Number,
        // required: [true, "password missing"],
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
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

// compare password
userSchema.methods.comparePassword = async function (humanPass) {
    return await bcrypt.compare(humanPass, this.password);
}

//generate access Token

// jwt.sign(payload, secret, options)
// This creates a JWT token (JSON Web Token).
// It has three parts:


userSchema.methods.generateAccessToken = async function () {
    return jwt.sign({
        userId: this._id, //Payload → Data you put inside (like userId, email, role).
        email: this.email,
        name: this.name,
        role: this.role
    },
        process.env.ACCESS_TOKEN_SECRET,/** Secret → Key to sign and secure the token (kept in .env) */
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE })  //Options → e.g. how long the token is valid.
}

//generate refresh Token
userSchema.methods.generateRefreshToke = async function () {
    return jwt.sign({
        userId: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE })
}

// verify accessToken ||This method checks if a given JWT token is valid
userSchema.methods.verifyAccessToken = async function (token) {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        return decoded   // return user data if valid
    } catch (error) {
        throw new CustomError(401, "your token is Invalid or expired")
    }
}


// verify refresh token

userSchema.methods.verifyRefreshToken = function (token) {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        return decoded   // return user data if valid
    } catch (error) {
        throw new CustomError(401, "your refresh token is Invalid or expired")
    }
}




module.exports = mongoose.model('User', userSchema);