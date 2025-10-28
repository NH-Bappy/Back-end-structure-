const { io } = require("socket.io-client");

const socket = io("http://localhost:4000");

// server-side
io.on("connection", (socket) => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

// client-side
socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
    console.log(socket.id); // undefined
});