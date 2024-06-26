const express = require('express');
const http = require('http'); // cần một máy chủ HTTP để Socket.IO có thể làm việc đúng cách

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000',
        // credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log(socket.id + ' was connected');
    socket.on('disconnect', () => {
        console.log(socket.id + ' was disconnected');
        console.log('user was left app ');
    });

    socket.on('join_app', (user) => {
        console.log(user + ' was join app');
    });

    socket.on('leave_app', (room) => {
        socket.leave(room);
        console.log('user was join app ', room);
    });

    socket.on('typing', (room) => {
        socket.in(room).emit('typing');
    });
    socket.on('stop_typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('new_message', (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit('message recieved', newMessageRecieved);
        });
    });
});

module.exports = { app, io, server };
