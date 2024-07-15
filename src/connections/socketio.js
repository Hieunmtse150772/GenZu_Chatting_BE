const express = require('express');
const http = require('http'); // cần một máy chủ HTTP để Socket.IO có thể làm việc đúng cách
const mongodb = require('mongodb');
const moment = require('moment');
const Conversation = require('@/model/conversation.model');
const User = require('@/model/user.model');
const FriendRequest = require('@/model/friendRequest.model');
const {
    createGroupChat,
    addMemberGroupChat,
    deleteMemberGroupChat,
    updateGroupChat,
    deleteGroupChat,
} = require('@/controller/group_chat.controller');
const { sendMessage } = require('@/controller/message.controller');

const { eventValidators } = require('@/validations');
const verifyTokenSocketMiddleware = require('@/middlewares/verifyTokenSocket.middleware');

const { createResponse } = require('@/utils/responseHelper');
const { MESSAGE_CODE, STATUS_CODE } = require('@/enums/response');

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
let userJoinRooms = new Map();

io.on('connection', async (socket) => {
    // verify user
    const token = socket.handshake.headers['authorization'];
    const error = verifyTokenSocketMiddleware(token, socket);

    if (error) return;

    socket.use((packet, next) => {
        const [event, data] = packet;

        // validate event
        if (eventValidators[event]) {
            const { error } = eventValidators[event].validate(data, { context: { user: socket.user } });
            if (error) {
                socket.emit(
                    'validation',
                    createResponse({ event, ...error }, error.details[0], null, STATUS_CODE.BAD_REQUEST, false),
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

    //Group chat
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

    socket.on('join conversation', (room) => {
        socket.join(room);
    });
    socket.on('send message', (data) => {
        sendMessage(data, socket);
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
            const user = await User.findById(userId).select('socketId');

            const isDuplicate = user.socketId.some((item) => item === socket.id);
            if (isDuplicate) {
                console.log('The socket id duplicate');
            } else {
                user.socketId.push = socket.id;
                is_online = true;
                await user.save();
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('logout', async (userId) => {
        try {
            const user = await User.findById(userId).select('socketId');
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

    //Create new conversation
    socket.on('access chat', (conversationInfo) => {
        console.log('access chat: ', conversationInfo.conversation.users);
        if (conversationInfo?.conversation) {
            for (i = 0; i < conversationInfo?.conversation?.users.length; i++) {
                if (conversationInfo?.conversation?.users[i]._id !== conversationInfo?.userId) {
                    socket.to(conversationInfo?.conversation.users[i]._id).emit('accessed chat', conversationInfo);
                }
            }
        }
    });

    //Set up room with conversation id for user who was join to chat
    socket.on('join chat', (room) => {
        if (room.conversation) {
            socket.join(room.conversation);
            const userIds = userJoinRooms.get(room.user);
            if (userIds) {
                const userId = userIds.get(room.conversation);
                if (userId) {
                    userId.add(socket.id);
                } else {
                    userIds.set(room.conversation, new Set([socket.id]));
                    // const newRoomId = new Map([[room.conversation, new Set([socket.id])]]);
                    userJoinRooms.set(room.user, userIds);
                }
            } else {
                // Nếu không tồn tại, tạo mới Key user chứa cuộc Key trò truyên chứa Set() socketId
                // const newRoomId = new Map([[room.conversation, new Set([socket.id])]]);
                const newRoomId = new Map([[room.conversation, new Set([socket.id])]]);
                userJoinRooms.set(room.user, newRoomId);
            }
            console.log('userIds: ', userJoinRooms);
        } else {
            console.log('room not found');
        }
    });

    //Out room chat with conversation id when user leave chat or not focus on chat room
    socket.on('leave chat', (room) => {
        if (room.conversation) {
            socket.leave(room.conversation);
            const roomIds = userJoinRooms.get(room.user);
            if (roomIds) {
                const roomId = roomIds.get(room.conversation);
                roomId.delete(socket.id);
                if (roomId.size === 0) {
                    roomIds.delete(room.conversation);
                } else {
                    userJoinRooms.set(room.user, roomIds);
                }
                if (roomIds.length === 0) {
                    userJoinRooms.delete(room.user);
                }
                // roomIds.delete(room.user);
                // if (userIds.size === 0) {
                //     userJoinRooms.delete(room.conversation);
                //     console.log(`Room ${room.conversation} is now empty and has been deleted.`);
                // } else {
                //     userJoinRooms.set(room.conversation, userIds);
                // }
            } else {
                console.log(`Không tìm thấy conversationId ${room.conversation}`);
            }
        } else {
            console.log('room not found');
        }
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
    socket.on('new message', async (newMessageReceived) => {
        if (!newMessageReceived || !newMessageReceived.conversation || !newMessageReceived.conversation._id) {
            console.error('Invalid newMessageReceived data');
            return;
        }
        const chatRoom = newMessageReceived.conversation._id;
        socket.to(chatRoom).emit('message received', newMessageReceived);
        console.log('----------------------------------------------------');
        const users = await Conversation.findById(chatRoom).select('users');
        if (users) {
            // const userInRooms = userJoinRooms.get(chatRoom);
            users.users.forEach((user) => {
                const socketUserInRoom = getSocketIdByRoomAndUserID(user, chatRoom);
                socketUserInRoom.forEach((socketId) => {
                    socket.to(socketId).emit('new message received', newMessageReceived);
                });
            });
        }
    });

    socket.on('disconnect', async (data) => {
        try {
            console.log('data: ', data);
            const user = await User.findOne({ socketId: socket.id }).select('socketId _id');

            if (user) {
                // //Xóa user ra khỏi các phòng
                // userJoinRooms.forEach((userSet, key) => {
                //     userSet.delete(String(user._id));
                //     // Nếu Set rỗng sau khi xóa, có thể tùy chọn xóa luôn key khỏi Map
                //     if (userSet.size === 0) {
                //         userMap.delete(key);
                //     }
                // });
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
    const getSocketIdByRoomAndUserID = (userId, roomId) => {
        const userInRoom = userJoinRooms.get(userId);
        if (userInRoom) {
            return userInRoom.get(roomId);
        }
        return [];
    };
});

module.exports = { app, io, server };
