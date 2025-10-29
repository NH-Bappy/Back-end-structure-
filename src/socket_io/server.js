const { Server } = require("socket.io");
const { httpServer } = require("../../app");
let io = null;
module.exports = {
    initSocket: (httpServer) => {
        try {
            io = new Server(httpServer, {
                cors:{
                    origin: "*",
                }
            });
            io.on("connection", (socket) => {
                console.log(socket);
            });
            io.on("disconnect", () => {
                console.log("user disconnect");
            })


        } catch (error) {
            console.log(error)
        }
    },
    getIo: () => {
        if (io !== null){
            return io;
        }
    },
};