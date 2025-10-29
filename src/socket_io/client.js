const { io } = require("socket.io-client");

const socket = io("http://localhost:4000" ,{
    transports: ["websocket"],
    query : {userId: "1234"}
});


// client-side
socket.on("connect", () => {
    console.log("client connected successfully to server",socket.id);
});









socket.on("disconnect", () => {
    console.log("client disconnected successfully to server ", socket.id); // undefined
});