const { asyncHandler } = require("../utils/asyncHandler");

exports.registration = asyncHandler((req ,res) => {
    console.log("he stop")
    res.send("OK")
})
