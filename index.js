const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*"
  }
});

let waitingUser = null;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  if (waitingUser) {
    const room = `room-${waitingUser.id}-${socket.id}`;
    socket.join(room);
    waitingUser.join(room);
    io.to(room).emit("chat-start", { room });
    waitingUser = null;
  } else {
    waitingUser = socket;
  }

  socket.on('message', ({ room, text }) => {
    io.to(room).emit('message', text);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (waitingUser === socket) waitingUser = null;
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
