const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
// const { Server } = require('socket.io');
const { initSocket } = require("./socket/socket.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");

// Load environment variables from .env file
dotenv.config();

// we can use env variables using process.env.VARIABLE_NAME
const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Create HTTP server from Express app
const server = http.createServer(app);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.log("Error occured"));

// INIT Socket.io
const io = initSocket(server);

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:3001"], // Allow both frontend and backend origins
//     credentials: true, // Allow cookies to be sent
//   })
// );

// middlewares
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// Instead of app.listen, use server.listen
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// No need to export io - it's available through getIO() from socket/socket.js
