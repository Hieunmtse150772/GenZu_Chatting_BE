const mongodb = require('mongodb');
const MESSAGE = require('@/enums/response/statusMessage.enum');
const FriendRequest = require('@/model/friendRequest.model');
const FriendShip = require('@/model/friendShip.model');
const MESSAGE_CODE = require('@/enums/response/messageCode.enum');
const { createResponse } = require('@/utils/responseHelper');
const STATUS_MESSAGE = require('@/enums/response/statusMessage.enum');
const { STATUS_CODE } = require('@/enums/response');
const Conversation = require('@/model/conversation.model');

module.exports = {
    getFriendList: async (req, res, next) => {
        try {
            const userId = req.user._id;
            if (!mongodb.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }
            // const senderId = req.user._id;
            var friendList = await FriendShip.find({
                users: userId,
                status: 'active',
            }).populate('users', 'fullName picture email is_online offline_at');
            var conversations = await Conversation.find({
                isGroupChat: false,
                $and: [{ users: { $elemMatch: { $eq: userId } } }],
            })
                .populate('users', '_id fullName email picture')
                .populate('latestMessage');

            friendList = friendList.map((friend) => {
                friendInfo = friend.users.filter((user) => user?._id.toString() !== userId.toString())[0];
                return {
                    info: friendInfo,
                    friendRequest: friend.friendRequest,
                    friendShip: friend._id,
                    status: friend.status,
                    isChat: Boolean(conversations),
                    conversation: conversations.filter((conversation) => {
                        const userIds = conversation.users.map((user) => String(user?._id));
                        return userIds.includes(String(userId)) && userIds.includes(String(friendInfo?._id));
                    }),
                    createdAt: friend.createdAt,
                    updatedAt: friend.updatedAt,
                };
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
            const friendList = await FriendRequest.find({
                receiver: user_id,
                status: 'pending',
            });

            return res.status(200).json({
                message: 'Get friend request list was successfully',
                messageCode: 'get_friend_request_list_successfully',
                data: friendList,
            });
        } catch (error) {
            next(error);
        }
    },
    getAddFriendRequestNotification: async (req, res, next) => {
        try {
            const user_id = req.user._id;
            if (!mongodb.ObjectId.isValid(user_id)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }
            const friendRequestList = await FriendRequest.find({
                $or: [
                    { receiver: user_id, status: 'pending' },
                    { receiver: user_id, status: 'accepted' },
                ],
            })
                .populate('sender', 'fullName picture _id')
                .populate('receiver', 'fullName picture _id');

            const notification = friendRequestList.map((friendRequest) => {
                return {
                    id: friendRequest._id,
                    sender: friendRequest.sender,
                    receiver: friendRequest.receiver,
                    status: friendRequest.status,
                    isRead: friendRequest.isRead,
                    content:
                        friendRequest.status === 'pending'
                            ? `Lời mời kết bạn từ ${friendRequest?.sender?.fullName}`
                            : `${friendRequest?.receiver?.fullName} và ${friendRequest?.sender?.fullName} đã trở thành bạn bè`,
                };
            });
            return res.status(200).json({
                message: 'Get friend request notification list was successfully',
                messageCode: 'get_friend_request_notification_list_successfully',
                data: notification,
            });
        } catch (error) {
            next(error);
        }
    },
    getAddFriendRequestHasBeenSent: async (req, res, next) => {
        try {
            const user_id = req.user._id;
            if (!mongodb.ObjectId.isValid(user_id)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }
            const friendList = await FriendRequest.find({
                sender: user_id,
                status: 'pending',
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
    createAddFriendRequest: async (req, res, next) => {
        try {
            const { id } = req.query;
            const senderId = req.user._id;

            if (String(senderId) === String(id)) {
                return res.status(400).json({
                    message: 'Can not add friend to yourself',
                    messageCode: 'can_not_add_friend_to_yourself',
                });
            }
            //Trường hợp đã là bạn bè
            const isFriend = await FriendShip.findOne({ users: { $all: [senderId, id] }, status: 'active' });
            if (isFriend) {
                return res.status(409).json({
                    messageCode: 'friend_already',
                    message: 'Your are friend already',
                });
            }
            //Trường hợp đã gửi request trước đó
            const isRequestExist = await FriendRequest.findOne({
                sender: senderId,
                receiver: id,
                status: 'pending',
            });
            if (isRequestExist) {
                return res.status(409).json({
                    messageCode: 'add_friend_request_already_exist',
                    message: 'Add friend request already exist',
                });
            }
            //Trường hợp đã có một người gửi request trước thì sẽ accept kết bạn khi người còn lại gửi kết bạn

            const request = await FriendRequest.findOne({
                $or: [
                    {
                        sender: id,
                        receiver: senderId,
                    },
                ],
            });
            if (request?.status === 'pending') {
                const updateRequest = await FriendRequest.findByIdAndUpdate(request?._id, { status: 'accepted' });
                const friendShip = await FriendShip.create({
                    users: [senderId, id],
                    friendRequest: request?._id,
                    status: 'active',
                });
                return res.status(200).json({
                    message: 'Add friend request accepted',
                    messageCode: 'add_friend_request_accepted',
                    data: friendShip,
                });
            }
            //Trường hợp chưa có ai gửi kết bạn thì sẽ tạo một request mới
            var addFriendRequest = await FriendRequest.create({
                sender: senderId,
                receiver: id,
                status: 'pending',
            });
            addFriendRequest = await addFriendRequest.populate('sender', 'fullName email picture');
            addFriendRequest = await addFriendRequest.populate('receiver', 'fullName email picture');
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
            const { id, statusRequest } = req.query;

            const friendRequest = await FriendRequest.findOne({
                id,
            });

            const { status } = await FriendRequest.findOne({
                users: { $all: [friendRequest.sender, friendRequest.receiver] },
                status: 'active',
            });

            if (status === 'accepted') {
                FriendRequest.findOneAndUpdate({
                    status: 'cancel',
                });
                return res.status(409).json({
                    messageCode: 'already_friend',
                    message: 'Your are already friend',
                });
            }

            const updateRequest = FriendRequest.findByIdAndUpdate(id, {
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
    acceptFriendRequest: async (req, res, next) => {
        try {
            const { id } = req.query;
            const receiverId = req.user._id;
            const friendRequest = await FriendRequest.findOne({
                _id: id,
            });
            if (String(friendRequest.receiver) !== String(receiverId)) {
                return res.status(200).json({
                    message: MESSAGE.NO_PERMISSION_ACCEPT_REQUEST,
                    messageCode: 'no_permission_accept_request',
                    status: MESSAGE_CODE.NO_PERMISSION_ACCEPT_REQUEST,
                });
            }
            const isFriend = await FriendShip.findOne({
                users: { $all: [friendRequest?.sender, friendRequest?.receiver] },
                status: 'active',
            });
            if (isFriend) {
                await FriendRequest.findByIdAndUpdate(
                    { _id: id, status: 'pending' },
                    {
                        status: 'cancel',
                    },
                );
                return res.status(409).json({
                    messageCode: 'already_friend',
                    message: MESSAGE.ALREADY_FRIEND,
                });
            }
            const updateRequest = await FriendRequest.findByIdAndUpdate(
                id,
                {
                    status: 'accepted',
                },
                { new: true },
            )
                .populate('sender', 'fullName email picture')
                .populate('receiver', 'fullName email picture');
            const updateFriendShip = await FriendShip.create({
                users: [receiverId, friendRequest.sender],
                status: 'active',
                friendRequest: id,
            });

            return res.status(201).json({
                message: MESSAGE.ACCEPT_FRIEND_SUCCESS,
                messageCode: 'accept_friend_successfully',
                data: updateRequest,
            });
        } catch (error) {
            next(error);
        }
    },
    rejectFriendRequest: async (req, res, next) => {
        const { id } = req.query;
        const receiverId = req.user._id;

        if (!mongodb.ObjectId.isValid(receiverId) || !mongodb.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }
        const friendRequest = await FriendRequest.findOne({
            _id: id,
        });
        if (String(friendRequest.receiver) !== String(receiverId)) {
            return res.status(200).json({
                message: MESSAGE.NO_PERMISSION_REJECT_REQUEST,
                messageCode: 'no_permission_accept_request',
                status: MESSAGE_CODE.NO_PERMISSION_REJECT_REQUEST,
            });
        }
        const isFriend = await FriendShip.findOne({
            users: { $all: [friendRequest?.sender, friendRequest?.receiver] },
            status: 'active',
        });
        if (isFriend) {
            await FriendRequest.findByIdAndUpdate(
                { _id: id, status: 'pending' },
                {
                    status: 'cancel',
                },
            );
            return res.status(409).json({
                messageCode: 'already_friend',
                message: MESSAGE.ALREADY_FRIEND,
            });
        }
        const updateRequest = await FriendRequest.findByIdAndUpdate(id, {
            status: 'rejected',
        });

        return res.status(201).json({
            message: MESSAGE.REJECT_FRIEND_SUCCESS,
            messageCode: 'reject_friend_successfully',
            status: MESSAGE_CODE.REJECT_FRIEND_SUCCESS,
            data: updateRequest,
        });
    },
    removeFriendRequest: async (req, res, next) => {
        const { id } = req.query;
        const senderId = req.user._id;

        if (!mongodb.ObjectId.isValid(senderId) || !mongodb.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }
        const friendRequest = await FriendRequest.findOne({
            _id: id,
        });
        if (String(friendRequest.sender) !== senderId) {
            return res.status(200).json({
                message: MESSAGE.NO_PERMISSION_REMOVE_REQUEST,
                messageCode: 'no_permission_remove_request',
                status: MESSAGE_CODE.NO_PERMISSION_REMOVE_REQUEST,
            });
        }
        const isFriend = await FriendShip.findOne({
            users: { $all: [friendRequest?.sender, friendRequest?.receiver] },
            status: 'active',
        });
        if (isFriend) {
            await FriendRequest.findByIdAndUpdate(
                { _id: id, status: 'pending' },
                {
                    status: 'cancel',
                },
            );
            return res.status(409).json({
                messageCode: 'already_friend',
                message: MESSAGE.ALREADY_FRIEND,
            });
        }
        const updateRequest = await FriendRequest.findByIdAndUpdate(id, {
            status: 'cancel',
        });

        return res.status(201).json({
            message: MESSAGE.REMOVE_FRIEND_REQUEST_SUCCESS,
            messageCode: 'remove_friend_request_successfully',
            status: MESSAGE_CODE.REMOVE_FRIEND_REQUEST_SUCCESS,
            data: updateRequest,
        });
    },
    removeFriend: async (req, res, next) => {
        const userId = req.user._id;
        const id = req.query.id;
        if (!mongodb.ObjectId.isValid(userId) || !mongodb.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }

        try {
            const friendShip = await FriendShip.findByIdAndDelete({ _id: id });
            const friendRequest = await FriendRequest.findByIdAndUpdate(
                friendShip.friendRequest,
                {
                    status: 'removed',
                },
                { new: true },
            );

            return res
                .status(200)
                .json(
                    createResponse(
                        friendRequest,
                        STATUS_MESSAGE.REMOVE_FRIEND_SUCCESS,
                        MESSAGE_CODE.REMOVE_FRIEND_SUCCESS,
                        STATUS_CODE.OK,
                        true,
                    ),
                );
        } catch (error) {}
    },
};
