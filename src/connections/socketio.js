const express = require('express');
const http = require('http'); // cần một máy chủ HTTP để Socket.IO có thể làm việc đúng cách
const mongodb = require('mongodb');
const cookie = require('cookie');

const User = require('@/model/user.model');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.URL_CLIENT,
        // credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log(socket.id + ' connect');
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    if (cookies && cookies.accessToken) {
        jwt.verify(cookies.accessToken, process.env.ACCESS_TOKEN_KEY, async function (err, decoded) {
            if (!err) {
                const user = await User.findByIdAndUpdate(
                    { _id: decoded.data },
                    { $push: { socketId: socket.id }, is_online: true },
                    { new: true },
                ).select('-password');
                if (user) {
                    console.log('The user is online');
                } else {
                    console.log('The user not found');
                }
            } else {
                console.log('Unauthorized');
            }
        });
    }

    socket.on('login', async (userId) => {
        try {
            if (!mongodb.ObjectId.isValid(userId)) {
                return console.log('The user id is invalid');
            }

            const user = await User.findByIdAndUpdate(
                { _id: userId },
                { $push: { socketId: socket.id }, is_online: true },
                { new: true },
            ).select('-password');

            if (user) {
                console.log('The user is online');
            } else {
                console.log('The user not found');
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('logout', async (userId) => {
        try {
            const user = await User.findById(userId).select('-password');
            if (user) {
                user.socketId = user.socketId.filter((item) => item !== socket.id);

                if (user.socketId.length) {
                    user.is_online = false;
                }

                await user.save();
                console.log('The user was logout');
            } else {
                console.log('The user not found');
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('typing', (room) => {
        socket.in(room).emit('typing');
    });
    socket.on('stop_typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.conversation;

        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach((user) => {
            console.log('userId: ', user._id);
            if (user?._id == newMessageReceived?.sender?._id) return;
            socket.in(user._id).emit('message received', newMessageReceived);
        });
    });

    socket.on('disconnect', async () => {
        try {
            const user = await User.findOne({ socketId: socket.id }).select('-password');
            if (user) {
                user.socketId = user.socketId.filter((item) => item !== socket.id);
                if (!user.socketId.length) {
                    user.is_online = false;
                }
                await user.save();
            }
            console.log(socket.id + ' disconnect');
        } catch (error) {
            console.log(error);
        }
    });
});

module.exports = { app, io, server };
