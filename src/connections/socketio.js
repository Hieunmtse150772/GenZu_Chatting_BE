const express = require('express');
const http = require('http'); // cần một máy chủ HTTP để Socket.IO có thể làm việc đúng cách
const mongodb = require('mongodb');
const cookie = require('cookie');
const moment = require('moment');

const User = require('@/model/user.model');
const jwt = require('jsonwebtoken');
const FriendRequest = require('@/model/friendRequest.model');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: [
            process.env.URL_CLIENT,
            process.env.URL_CLIENT_LOCAL,
            process.env.URL_CLIENT_TEST,
            process.env.URL_CLIENT_DEPLOY,
            'http://localhost:5173',
        ],
        // credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log(socket.id + ' connect');
    //Set up id user to sent message
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });

    //Send request add friend
    socket.on('friend request', (newRequest) => {
        const receiverId = newRequest.receiver._id;
        socket.to(receiverId).emit('received request', newRequest);
    });

    //Accept request friend
    socket.on('accept request', (newRequest) => {
        const senderId = newRequest.sender._id;
        socket.to(senderId).emit('received reply', newRequest);
    });

    //Check is read friend request
    socket.on('read request', async (newRequest) => {
        const newRequestId = newRequest._id;
        const sender = newRequest.sender._id;
        const updateRequest = await FriendRequest.findByIdAndUpdate(newRequestId, { isRead: true });
        socket.to(sender).emit('isRead', true);
    });

    const cookies = cookie.parse(socket?.handshake?.headers?.cookie ? socket?.handshake?.headers?.cookie : '');
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
                    user.offline_at = moment();
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

    //Set up room with conversation id for user who was join to chat
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User Joined Room: ' + room);
    });

    //Out room chat with conversation id when user leave chat or not focus on chat room
    socket.on('leave chat', (room) => {
        socket.leave(room);
        console.log('user leave room: ', room);
    });

    //Listening the action type of user when they are typing
    socket.on('typing', (room) => {
        socket.in(room).emit('typing');
    });

    //Listening the action stop type of user when they was stopped typing
    socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));

    //Listening the action reacting message with emoji
    socket.on('add emoji', (emojiAdded) => {
        if (!emojiAdded.conversation._id) {
            console.log('Invalid conversation id');
            return;
        }
        const chatRoom = emojiAdded.conversation._id;

        socket.to(chatRoom).emit('emoji received', emojiAdded);
    });

    //Listening the action edit emoji
    socket.on('edit emoji', (emojiAdded) => {
        if (!emojiAdded.conversation._id) {
            console.log('Invalid conversation id');
            return;
        }
        const chatRoom = emojiAdded.conversation._id;

        socket.to(chatRoom).emit('emoji received', emojiAdded);
    });

    //Listening the action delete emoji
    socket.on('delete emoji', (emojiAdded) => {
        if (!emojiAdded.conversation._id) {
            console.log('Invalid conversation id');
            return;
        }
        const chatRoom = emojiAdded.conversation._id;

        socket.to(chatRoom).emit('emoji received', emojiAdded);
    });

    // Gửi thông báo tin nhắn đã bị thu hồi đến tất cả socket trong phòng, ngoại trừ socket của người gửi
    socket.on('recall', (messageRecalled) => {
        if (!messageRecalled || !messageRecalled.conversation || !messageRecalled.conversation._id) {
            console.error('Invalid newMessageReceived data');
            return;
        }

        const chatRoom = messageRecalled.conversation._id;

        socket.to(chatRoom).emit('recall', messageRecalled);
    });

    // Gửi tin nhắn đến tất cả socket trong phòng, ngoại trừ socket của người gửi
    socket.on('new message', (newMessageReceived) => {
        if (!newMessageReceived || !newMessageReceived.conversation || !newMessageReceived.conversation._id) {
            console.error('Invalid newMessageReceived data');
            return;
        }

        const chatRoom = newMessageReceived.conversation._id;

        socket.to(chatRoom).emit('message received', newMessageReceived);

        console.log('Message sent to room: ' + chatRoom);
    });

    socket.on('disconnect', async () => {
        try {
            const user = await User.findOne({ socketId: socket.id }).select('-password');
            if (user) {
                user.socketId = user.socketId.filter((item) => item !== socket.id);
                if (!user.socketId.length) {
                    user.offline_at = moment();
                    user.is_online = false;
                }
                await user.save();
            }
            console.log(socket.id + ' disconnect');
        } catch (error) {
            console.log(error);
        }
    });
    // socket.off('setup', (userData) => {
    //     console.log('USER DISCONNECTED');
    //     socket.leave(userData._id);
    // });
});

module.exports = { app, io, server };
