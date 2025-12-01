const { asyncHandler } = require("../utils/asyncHandler");


exports.authGuard = asyncHandler(async (req , res ,next ) => {
    console.log(req.headers)
})