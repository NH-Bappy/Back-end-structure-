const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const { globalErrorHandler } = require('./src/utils/globalErrorHandler');
const { createServer } = require("http");
const { initSocket } = require('./src/socket_io/server');
const app = express();




// use of middleware

// Make a json to object

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
})); //kaon server ke  data dibo kaon server ke  data dibo na ta thik kore 

// routes

app.use('/api/v1' , require('./src/routes/index.api'))



//global error handling middleWare

app.use(globalErrorHandler)


// server for Socket io
const httpServer = createServer(app);
initSocket(httpServer)




module.exports = { httpServer };