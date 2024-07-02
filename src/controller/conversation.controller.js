const mongodb = require('mongodb');

const Conversation = require('../model/conversation.model');
const Message = require('../model/message.model');
const User = require('../model/user.model');

module.exports = {
    accessConversation: async (req, res, next) => {
        const { userId } = req.query;

        if (!userId) {
            console.log('UserId param not sent with request');
            return res.sendStatus(400);
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
                .populate('users', '-password')
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
};
