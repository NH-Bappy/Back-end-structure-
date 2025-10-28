const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const { globalErrorHandler } = require('./src/utils/globalErrorHandler');
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
//socket io



// use of middleware

// Make a json to object

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({origin: ["http://localhost:4000"]})) //kaon server ke  data dibo kaon server ke  data dibo na ta thik kore 

// routes

app.use('/api/v1' , require('./src/routes/index.api'))



//global error handling middleWare

app.use(globalErrorHandler)


// server for Socket io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: "*"
});
io.on("connection" , (socket) => {
    console.log(socket);
});
io.on("disconnect" , () => {
    console.log("user disconnect");
});

module.exports = { httpServer };