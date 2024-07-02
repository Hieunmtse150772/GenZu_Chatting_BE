const mongodb = require('mongodb');

const Conversation = require('../model/conversation.model');
const Friend = require('../model/friend.model');

module.exports = {
    getFriendList: async (req, res, next) => {
        try {
            const user_id = req.user._id;
            if (!mongodb.ObjectId.isValid(user_id)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }
            const friendList = await Friend.find({
                $or: [
                    {
                        sender: user_id,
                    },
                    {
                        receiver: user_id,
                    },
                ],
                status: 'accepted',
            });

            if (!friendList) {
                return res.status(200).json({
                    message: 'Get friend list was successfully.',
                    messageCode: 'get_friend_list_successfully',
                    data: [],
                });
            }
            return res.status(200).json({
                message: 'Get friend list was successfully',
                messageCode: 'get_friend_list_successfully',
                data: friendList,
            });
        } catch (error) {
            next(error);
        }
    },
    getAddFriendRequest: async (req, res, next) => {
        try {
            const user_id = req.user._id;
            if (!mongodb.ObjectId.isValid(user_id)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }

            const friendList = await Friend.find({
                'user.user_id': req.user?._id,
            });

            if (!friendList) {
                return res.status(200).json({
                    message: 'Get friend list was successfully.',
                    messageCode: 'get_friend_list_successfully',
                    data: [],
                });
            }
            return res.status(200).json({
                message: 'Get friend list was successfully',
                messageCode: 'get_friend_list_successfully',
                data: friendList,
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

            const senderId = req.user._id;
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
                return res.status(409).json({
                    messageCode: 'add_friend_request_already_exist',
                    message: 'Add friend request already exist',
                });
            }
            const addFriendRequest = await Friend.create({
                sender: senderId,
                receiver: receiverId,
                status: 'sended',
            })
                .populate('sender', '-password')
                .populate('receiver', '-password');
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
            const { requestId, statusRequest } = req.query;

            const friendRequest = await Friend.findOne({
                requestId,
            });
            const { status } = await Friend.findOne({
                $or: [
                    {
                        sender: friendRequest.sender,
                        receiver: friendRequest.receiver,
                    },
                    {
                        sender: friendRequest.receiver,
                        receiver: friendRequest.sender,
                    },
                ],
            });
            if (status === 'accepted') {
                Friend.findOneAndUpdate({
                    status: 'cancel',
                });
                return res.status(409).json({
                    messageCode: 'already_friend',
                    message: 'Your are already friend',
                });
            }
            const updateRequest = Friend.findByIdAndUpdate({
                status: statusRequest,
            });
            return res.status(201).json({
                message: 'Accept friend request successfully',
                messageCode: 'accept_friend_successfully',
                data: updateRequest,
            });
        } catch (error) {
            next(error);
        }
    },
};
