const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Serve React static build
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));

});

// Socket.IO communication
io.on('connection', (socket) => {
  console.log('📲 Client connected:', socket.id);

  socket.on('pose-change', (pose) => {
    console.log(`🔄 Relaying pose: ${pose}`);
    socket.broadcast.emit('pose-change', pose);
  });

  socket.on('joint-control', (data) => {
    console.log(`🎚️ Relaying joint-control:`, data);
    socket.broadcast.emit('joint-control', data);
  });

  socket.on('camera-frame', (frameDataURL) => {
    socket.broadcast.emit('camera-frame', frameDataURL);
  });

  socket.on('start-camera', () => {
    socket.broadcast.emit('start-camera');
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
