const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// In-memory room storage (RAM only)
const rooms = {};
const userRooms = {};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('create-room', async ({ roomName, password }) => {
      console.log('EVENT: create-room', { roomName });
      try {
        const roomId = uuidv4();
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        rooms[roomId] = {
          name: roomName || 'Secure Session',
          password: hashedPassword,
          ownerId: socket.id,
          messages: [],
          users: []
        };

        socket.emit('room-created', { roomId });
        console.log(`Room created: ${roomId} by ${socket.id}`);
      } catch (err) {
        console.error('Error creating room:', err);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    socket.on('join-room', async ({ roomId, nickname, password }) => {
      console.log('EVENT: join-room', { roomId, nickname });
      try {
        if (!rooms[roomId]) {
          console.warn(`Join failed: Room ${roomId} not found`);
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (rooms[roomId].password) {
          const isMatch = await bcrypt.compare(password || '', rooms[roomId].password);
          if (!isMatch) {
            console.warn(`Join failed: Auth failed for room ${roomId}`);
            socket.emit('auth-failed', { message: 'Incorrect password' });
            return;
          }
        }

        socket.join(roomId);
        userRooms[socket.id] = roomId;
        rooms[roomId].users.push({ id: socket.id, nickname });

        socket.to(roomId).emit('user-joined', { nickname });
        
        socket.emit('room-ready', {
          name: rooms[roomId].name,
          isOwner: rooms[roomId].ownerId === socket.id,
          history: rooms[roomId].messages,
          onlineCount: rooms[roomId].users.length
        });

        io.to(roomId).emit('user-count', rooms[roomId].users.length);
        console.log(`${nickname} joined room ${roomId}`);
      } catch (err) {
        console.error('Error joining room:', err);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('rename-room', ({ roomId, newName }) => {
      console.log('EVENT: rename-room', { roomId, newName });
      if (!rooms[roomId] || rooms[roomId].ownerId !== socket.id) {
        console.warn(`Rename blocked: ${socket.id} is not owner of ${roomId}`);
        return;
      }
      
      rooms[roomId].name = newName;
      io.to(roomId).emit('room-renamed', { newName });
      console.log(`Room ${roomId} renamed to ${newName}`);
    });

    socket.on('send-message', ({ roomId, message, nickname, attachment }) => {
      if (!rooms[roomId]) return;

      const msgData = {
        id: Date.now().toString(),
        text: message,
        sender: nickname,
        attachment: attachment || null,
        timestamp: new Date().toISOString()
      };

      rooms[roomId].messages.push(msgData);
      io.to(roomId).emit('receive-message', msgData);
    });

    socket.on('disconnect', () => {
      const roomId = userRooms[socket.id];
      if (roomId && rooms[roomId]) {
        const userIndex = rooms[roomId].users.findIndex(u => u.id === socket.id);
        if (userIndex !== -1) {
          const user = rooms[roomId].users[userIndex];
          rooms[roomId].users.splice(userIndex, 1);
          
          socket.to(roomId).emit('user-left', { nickname: user.nickname });
          io.to(roomId).emit('user-count', rooms[roomId].users.length);
          
          if (rooms[roomId].users.length === 0) {
            delete rooms[roomId];
            console.log(`Room ${roomId} wiped (empty)`);
          }
        }
      }
      delete userRooms[socket.id];
      console.log('User disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
