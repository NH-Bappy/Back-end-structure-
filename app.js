const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const cors = require('cors');

// use of middleware


// Make a json to object

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({origin: ["http://localhost:4000"]}))

// routes

app.use('/api/v1' , require('./src/routes/api/index.api'))



//global error handling middleWare









module.exports = {app};