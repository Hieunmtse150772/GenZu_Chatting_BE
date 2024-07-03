const mongodb = require('mongodb');

const Conversation = require('../model/conversation.model');
const FriendShip = require('../model/friendShip.model');
const Message = require('../model/message.model');
const User = require('../model/user.model');
const MESSAGE_CODE = require('@/enums/messageCode.enum');
const STATUS_MESSAGE = require('@/enums/message.enum');

module.exports = {
    accessConversation: async (req, res, next) => {
        const { userId } = req.body;
        if (!userId) {
            console.log('UserId param not sent with request');
            return res.sendStatus(400);
        }
        if (!mongodb.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'The user id is invalid',
                messageCode: 'invalid_userId',
            });
        }
        const isFriend = await FriendShip.findOne({ users: { $all: [userId, req.user._id] }, status: 'active' });
        if (!isFriend) {
            return res.status(200).json({
                message: 'Your are not a friend, pls add friend before send message',
                messageCode: 'not_a_friend',
                status: 1002,
            });
        }
        var isChat = await Conversation.find({
            isGroupChat: false,
            $and: [{ users: { $elemMatch: { $eq: req.user._id } } }, { users: { $elemMatch: { $eq: userId } } }],
        })
            .populate('users', '-password')
            .populate('latestMessage');

        isChat = await User.populate(isChat, {
            path: 'latestMessage.sender',
            select: 'fullName picture email',
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            console.log('user: ', res);

            var chatData = {
                chatName: 'sender',
                isGroupChat: false,
                users: [req.user._id, userId],
            };
            console.log('chatData: ', chatData);
            try {
                const createdChat = await Conversation.create(chatData);
                const FullChat = await Conversation.findOne({
                    _id: createdChat._id,
                }).populate('users', '-password');
                res.status(200).json(FullChat);
            } catch (error) {
                res.status(400);
                throw new Error(error.message);
            }
        }
    },
    getConversations: async (req, res, next) => {
        try {
            const user_id = req.user._id;
            if (!mongodb.ObjectId.isValid(user_id)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }
            // const senderId = req.user._id ;

            const conversations = await Conversation.find({
                'user.user_id': req.user?._id,
            });

            if (!conversations) {
                return res.status(200).json({
                    message: 'Get conversations was successfully.',
                    messageCode: 'get_conversations_successfully',
                    data: [],
                });
            }
            return res.status(200).json({
                message: 'Get conversations was successfully',
                messageCode: 'get_conversations_successfully',
                data: conversations,
            });
        } catch (error) {
            next(error);
        }
    },
    fetchConversation: async (req, res, next) => {
        try {
            console.log('userId: ', req.user._id);
            Conversation.find({ users: { $elemMatch: { $eq: req.user._id } } })
                .populate('users', 'email fullName picture')
                .populate('groupAdmin', '-password')
                .populate('latestMessage')
                .sort({ updatedAt: -1 })
                .then(async (results) => {
                    results = await User.populate(results, {
                        path: 'latestMessage.sender',
                        select: 'fullName picture email',
                    });
                    // res.status(200).json({
                    //   message: 'Get conversations was successfully',
                    //   messageCode: 'get_conversations_successfully',
                    //   data: results,
                    // });
                    res.status(200).send(results);
                });
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    },
    createGroupConversation: async (req, res, next) => {
        const userId = req.user._id;
        console.log('userId: ', userId);

        if (!req.body.users || !req.body.name) {
            return res.status(400).send({ message: 'Please Fill all the field!' });
        }
        var users = JSON.parse(req.body.users);

        if (users.length < 2) {
            return res.status(400).send({ message: 'Please add more than 1 user to create a group chat!' });
        }

        users.push(userId);

        try {
            const groupChat = await Conversation.create({
                chatName: req.body.name,
                isGroupChat: true,
                users: users,
                groupAdmin: userId,
            });
            const fullGroupChatInfo = await Conversation.findOne({
                _id: groupChat._id,
            })
                .populate('users', 'picture fullName _id email')
                .populate('groupAdmin', 'picture fullName _id email');
            return res.status(201).json({
                data: fullGroupChatInfo,
                message: 'Create group chat successful',
                messageCode: 'create_group_chat_successful',
            });
        } catch (error) {
            return next(error);
        }
    },
    removeConversation: async (req, res, next) => {
        const conversationId = req.query.conversationId;
        const userId = req.user._id;
        if (!mongodb.ObjectId.isValid(userId) || !mongodb.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }
        try {
            const conversation = await Conversation.findByIdAndUpdate(
                { conversationId },
                { $push: { deleteBy: userId } },
            );
            return res.status(200).json({
                data: conversation,
                message: STATUS_MESSAGE.REMOVE_CONVERSATION_SUCCESS,
            });
        } catch (error) {
            return next(error);
        }
    },
    // sendMessage: async (req, res, next) => {
    //   try {
    //     const receiverId = req.params.id;

    //     if (!mongodb.ObjectId.isValid(receiverId)) {
    //       return res.status(400).json({
    //         message: 'The receiverId is invalid',
    //         messageCode: 'invalid_receiverId',
    //       });
    //     }
    //     const senderId = req.user._id ;
    //     const { message } = req.body;

    //     let conversation = await Conversation.findOne({
    //       paticipants: { $all: [senderId, receiverId] },
    //     });

    //     if (!conversation) {
    //       conversation = new Conversation({
    //         paticipants: [senderId, receiverId],
    //       });
    //     }

    //     const newMessage = await Message.create({
    //       senderId,
    //       receiverId,
    //       message,
    //     });

    //     if (newMessage) {
    //       conversation.messages.push(newMessage._id);
    //     }

    //     await conversation.save();

    //     return res.status(201).json({
    //       message: 'Message sent successfully',
    //       messageCode: 'sent_successfully',
    //       data: message,
    //     });
    //   } catch (error) {
    //     next(error);
    //   }
    // },
};
