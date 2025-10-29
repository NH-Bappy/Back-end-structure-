// Import the Server class from socket.io package
const { Server } = require("socket.io");

let io = null; // This will hold our Socket.io instance after initialization

module.exports = {
    /**
     * Initialize the Socket.io server with the provided HTTP server.
     * This function should be called once when your app starts.
     */
    initSocket: (httpServer) => {
        try {
            // Create a new Socket.io server and attach it to the HTTP server
            io = new Server(httpServer, {
                cors: {
                    origin: "*", // Allow all origins (you can restrict this later)
                },
            });

            // Listen for new client connections
            io.on("connection", (socket) => {
                console.log("✅ User connected successfully:", socket.id);



                // Extract the user ID sent from the frontend during the initial connection (handshake)
                // Example: if client connects with io("server_url", { query: { userId: "123" } })
                // then userId will be "123"
                const userId = socket.handshake.query.userId;
                console.log(userId)

                // Join a private room named after the user's ID
                // This allows the server to send messages specifically to this user later
                // Example: io.to(userId).emit("notification", { message: "Hello!" });
                socket.join(userId);




                /**
                 * Listen for the client disconnecting.
                 * This event is triggered automatically when the client closes the connection
                 * (for example, closes the browser tab or loses internet).
                 */
                socket.on("disconnect", () => {
                    console.log("❌ User disconnected:", socket.id);
                });

                /**
                 * You can also handle custom events here (example below)
                 * socket.on("chatMessage", (data) => {
                 *     console.log("Message received:", data);
                 *     io.emit("chatMessage", data); // Send message to all clients
                 * });
                 */
            });

        } catch (error) {
            // If something goes wrong during initialization, log the error
            console.error("⚠️ Socket initialization error:", error);
        }
    },

    /**
     * Get the initialized Socket.io instance.
     * Useful for emitting events from other parts of your backend.
     * Throws an error if Socket.io is not yet initialized.
     */
    getIo: () => {
        if (!io) {
            throw new Error("❗Socket.io has not been initialized yet! Call initSocket(httpServer) first.");
        }
        return io;
    },
};
