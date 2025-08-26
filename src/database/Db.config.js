const mongoose = require('mongoose');
require('dotenv').config();
const {DbName} = require('../constants/constant');





exports.connectDatabase = async () => {
    try {
        const db = await mongoose.connect(`${process.env.MONGODB_URL}/${DbName}`);
        console.log("Database connection successful",db.connection.host)
    } catch (error) {
        console.log("error from database connection" , error)
    }
}