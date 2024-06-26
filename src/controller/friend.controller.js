const mongodb = require('mongodb');

const Conversation = require('../model/conversation.model');
const Friend = require('../model/friend.model');

module.exports = {
    getFriendList: async (req, res, next) => {
        try {
            const user_id = req.user.data;
            if (!mongodb.ObjectId.isValid(user_id)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }
            // const senderId = req.user.data;

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
    sendAddFriendRequest: async (req, res, next) => {
        try {
            const { receiverId } = req.query;

            if (!mongodb.ObjectId.isValid(receiverId)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }

            const senderId = req.user.data;
            const isFriend = await Friend.findOne({
                $and: [
                    {
                        sender: senderId,
                    },
                    {
                        receiver: receiverId,
                    },
                ],
            });
            if (isFriend) {
                res.status();
            }
            const addFriendRequest = await Friend.create({
                senderId,
                receiverId,
            });

            return res.status(201).json({
                message: 'Send add friend request successfully',
                messageCode: 'sent_add_friend_successfully',
                data: addFriendRequest,
            });
        } catch (error) {
            next(error);
        }
    },
    updateFriendRequest: async (req, res, next) => {
        try {
            const { requestId, status } = req.query;

            const addFriendRequest = await Friend.findOne({
                sender_id,
                receiverId,
            });

            return res.status(201).json({
                message: 'Send add friend request successfully',
                messageCode: 'sent_add_friend_successfully',
                data: addFriendRequest,
            });
        } catch (error) {
            next(error);
        }
    },
};
