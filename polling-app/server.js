require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const socketIo = require('socket.io');
const { handleSocketConnection } = require('./src/websocket/socketHandler');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  handleSocketConnection(socket, io);
});

// Make io available globally
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});