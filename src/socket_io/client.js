const { io } = require("socket.io-client");

const socket = io("http://localhost:4000" ,{
    transports: ["websocket"],
    query : {userId: "1234"}
});


// client-side
socket.on("connect", () => {
    console.log("client connected successfully to server",socket.id);
});


// grave the data to server
socket.on('addToCart' , (data) => {
    console.log("data is " , data)
})

// clint sending data to server

socket.emit("test" , "hello")


socket.on("disconnect", () => {
    console.log("client disconnected successfully to server ", socket.id); // undefined
});