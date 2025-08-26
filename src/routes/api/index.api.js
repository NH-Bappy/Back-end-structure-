const express = require('express');
const _ = express.Router();



_.use("/auth", require('./user.api'))





module.exports = _;

