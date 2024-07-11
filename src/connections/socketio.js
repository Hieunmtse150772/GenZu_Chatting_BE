const express = require('express');
const http = require('http'); // cần một máy chủ HTTP để Socket.IO có thể làm việc đúng cách
const mongodb = require('mongodb');
const moment = require('moment');

const User = require('@/model/user.model');
const FriendRequest = require('@/model/friendRequest.model');
const {
    createGroupChat,
    addMemberGroupChat,
    deleteMemberGroupChat,
    updateGroupChat,
    deleteGroupChat,
} = require('@/controller/group_chat.controller');

const createResponse = require('@/utils/responseHelper');
const { MESSAGE_CODE, STATUS_CODE } = require('@/enums/response');
const { eventValidators } = require('@/enums/validate');
const verifyTokenSocketMiddleware = require('@/middlewares/verifyTokenSocket.middleware');

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
            'http://127.0.0.1:5173',
        ],
        // credentials: true,
    },
});
let userJoinRooms = {};

io.on('connection', async (socket) => {
    // verify user
    const token = socket.handshake.headers['authorization'];
    const error = verifyTokenSocketMiddleware(token, socket);

    if (error) return;

    socket.use((packet, next) => {
        const [event, data] = packet;

        // validate event
        if (eventValidators[event]) {
            const { error } = eventValidators[event].validate(data);
            if (error) {
                socket.emit(
                    'validation',
                    createResponse({ event, ...error }, error, null, STATUS_CODE.BAD_REQUEST, false),
                );
                return;
            }
        }
        next();
    });

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

    // group chat
    socket.on('create group', (data) => {
        createGroupChat(data, socket);
    });
    socket.on('add member', (data) => {
        addMemberGroupChat(data, socket);
    });
    socket.on('delete member', (data) => {
        deleteMemberGroupChat(data, socket);
    });
    socket.on('update group', (data) => {
        updateGroupChat(data, socket);
    });
    socket.on('delete group', (data) => {
        deleteGroupChat(data, socket);
    });

    //Check is read friend request
    socket.on('read request', async (newRequest) => {
        const newRequestId = newRequest._id;
        const sender = newRequest.sender._id;
        const updateRequest = await FriendRequest.findByIdAndUpdate(newRequestId, { isRead: true });
        socket.to(sender).emit('isRead', true);
    });

    socket.on('login', async (userId) => {
        try {
            if (!mongodb.ObjectId.isValid(userId)) {
                return socket.emit(
                    'validation',
                    createResponse(
                        null,
                        STATUS_MESSAGE.ACCOUNT_INACTIVE,
                        MESSAGE_CODE.ACCOUNT_INACTIVE,
                        STATUS_CODE.FORBIDDEN,
                        false,
                    ),
                );
            }

            const user = await User.findById(userId).select('-password');

            const isDuplicate = user.socketId.some((item) => item === socket.id);
            if (isDuplicate) {
                console.log('The user id duplicate');
            } else {
                user.socketId.push = socket.id;
                is_online = true;

                const newUser = await user.save();

                if (newUser) {
                    console.log('The user is online');
                }
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
        socket.join(room.conversation);
        if (userJoinRooms[room.conversation]) {
            userJoinRooms[room.conversation].push(room.user);
        } else {
            userJoinRooms[room.conversation] = [room.user];
        }
        console.log(userJoinRooms);
        console.log('User Joined Room: ' + room?.user);
    });

    //Out room chat with conversation id when user leave chat or not focus on chat room
    socket.on('leave chat', (room) => {
        console.log('room pull: ', room.conversation);
        console.log('user pull: ', room.user);
        socket.leave(room.conversation);
        // userJoinRooms[room.conversation].pull(room.user);
        console.log('user leave room: ', room.user);
    });

    //Listening the action type of user when they are typing
    socket.on('typing', (room) => {
        socket.in(room).emit('typing');
    });

    //Listening the action stop type of user when they was stopped typing
    socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));

    //Listening the action reacting message with emoji
    socket.on('add emoji', (emojiAdded) => {
        if (!emojiAdded.conversation) {
            console.log('Invalid conversation id');
            return;
        }
        const chatRoom = emojiAdded.conversation;

        socket.to(chatRoom).emit('emoji received', emojiAdded);
    });

    //Listening the action edit emoji
    socket.on('edit emoji', (emojiAdded) => {
        if (!emojiAdded.conversation) {
            console.log('Invalid conversation id');
            return;
        }
        const chatRoom = emojiAdded.conversation;

        socket.to(chatRoom).emit('emoji received', emojiAdded);
    });

    //Listening the action delete emoji
    socket.on('delete emoji', (emojiAdded) => {
        if (!emojiAdded.conversation) {
            console.log('Invalid conversation id');
            return;
        }
        const chatRoom = emojiAdded.conversation;

        socket.to(chatRoom).emit('emoji received', emojiAdded);
    });

    // Gửi thông báo tin nhắn đã bị thu hồi đến tất cả socket trong phòng, ngoại trừ socket của người gửi
    socket.on('recall', (messageRecalled) => {
        console.log('socket recall: ', messageRecalled.data.data);
        if (!messageRecalled || !messageRecalled.data.data.conversation) {
            console.error('Invalid newMessageReceived data');
            return;
        }

        const chatRoom = messageRecalled.data.data.conversation;
        console.log('chat room: ', chatRoom);
        socket.to(chatRoom).emit('recall received', messageRecalled);
    });

    // Gửi tin nhắn đến tất cả socket trong phòng, ngoại trừ socket của người gửi
    socket.on('new message', (newMessageReceived) => {
        if (!newMessageReceived || !newMessageReceived.conversation || !newMessageReceived.conversation._id) {
            console.error('Invalid newMessageReceived data');
            return;
        }

        const chatRoom = newMessageReceived.conversation._id;

        socket.to(chatRoom).emit('message received', newMessageReceived);
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
