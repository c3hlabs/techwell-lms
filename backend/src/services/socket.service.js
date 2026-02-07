const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 User Connected: ${socket.id}`);

        // Join specific room (topic or chat ID)
        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        // Send message to room
        socket.on('send_message', (data) => {
            // data expects: { room, message, author, time }
            socket.to(data.room).emit('receive_message', data);
        });

        // Typing indicator
        socket.on('typing', (data) => {
            socket.to(data.room).emit('user_typing', data);
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initializeSocket, getIO };
