require('module-alias/register');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const routes = require('@/routes');
require('@/connections/mongodb');
const { app, server, io } = require('@/connections/socketio');

const port = process.env.PORT || 3000;

// middleware
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());
app.use(cookieParser());
// routes
routes(app);

app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        status: statusCode,
    });
    next();
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

io.on('connection', (socket) => {
    console.log('socket was connected');
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('user join room ', room);
    });
    socket.on('typing', (room) => {
        socket.in(room).emit('typing');
    });
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit('message received', newMessageReceived);
        });
    });

    socket.off('setup', () => {
        console.log('USER DISCONNECTED');
        socket.leave(userData._id);
    });
});
