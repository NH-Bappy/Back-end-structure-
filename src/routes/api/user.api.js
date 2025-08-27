const express = require('express');
const _ = express.Router();
const userController = require('../../controller/user.controller')

_.route("/registration").post(userController.registration)


module.exports = _;


// (req , res) => {
//     console.log("hello Bappy");
//     res.end("hi bappy")
// }