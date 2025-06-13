// server/index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // For testing; restrict in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("move", (direction) => {
    socket.broadcast.emit("move", direction);
  });

  socket.on("toggle-camera", (status) => {
    socket.broadcast.emit("toggle-camera", status);
  });

  socket.on("viewer-ready", () => {
    socket.broadcast.emit("viewer-ready");
  });

  socket.on("offer", (offer) => {
    socket.broadcast.emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.broadcast.emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.broadcast.emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
