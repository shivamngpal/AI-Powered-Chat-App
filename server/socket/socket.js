const http = require("http");
const { Server } = require("socket.io");

// stores {userId:socketId}
const userSocketMap = {};

// Store io instance
let io;

const initSocket = (server) => {
  const allowedOrigins = process.env.CLIENT_URL
    ? [process.env.CLIENT_URL]
    : ["http://localhost:3000", "http://localhost:3001"];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // handle connections
  io.on("connection", (socket) => {
    console.log("A User Connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} is now online`);
    }

    // Broadcast online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      if (userId) {
        delete userSocketMap[userId];
        console.log(`User ${userId} is now offline`);
      }

      // Broadcast updated online users
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    // Handle typing events
    socket.on("typing", ({ receiverId, isTyping }) => {
      const receiverSocketId = userSocketMap[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId: userId,
          isTyping: isTyping,
        });
      }
    });
  });
  return io;
};

// Helper function to get receiver's socket ID
const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Helper function to get io instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized! Call initSocket first.");
  }
  return io;
};

module.exports = { initSocket, getReceiverSocketId, getIO };
