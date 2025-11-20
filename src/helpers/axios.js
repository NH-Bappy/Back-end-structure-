const axios = require('axios')
require('dotenv').config()





const API = axios.create({
    baseURL: `${process.env.BASE_URL}`,
    timeout: 1000,
    headers: {
        'Api-Key': `${process.env.STEADFAST_API_KEY}`,
        'Secret-Key': ` ${process.env.STEADFAST_SECRET_KEY}`,
        "Content-Type": "application/json"
    },
});

module.exports = { API }