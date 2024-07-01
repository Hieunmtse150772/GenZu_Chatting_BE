const mongodb = require('mongodb');
const MESSAGE = require('@/enums/message.enum');
const FriendRequest = require('@/model/friendRequest.model');
const FriendShip = require('@/model/friendShip.model');
const MESSAGE_CODE = require('@/enums/messageCode.enum');

module.exports = {
    getFriendList: async (req, res, next) => {
        try {
            const userId = req.user.data;
            if (!mongodb.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }
            // const senderId = req.user.data;
            console.log('userId: ', userId);
            var friendList = await FriendShip.find({
                users: userId,
                status: 'active',
            }).populate('users', 'fullName picture email');
            friendList = friendList.map(
                (friend) => friend.users.filter((user) => user._id.toString() !== userId.toString())[0],
            );
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
            const user_id = req.user.data;
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
            const { receiverId } = req.query;
            const senderId = req.user.data;

            console.log('receiverId: ', receiverId);
            if (!mongodb.ObjectId.isValid(receiverId) || !mongodb.ObjectId.isValid(senderId)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }

            //Trường hợp đã là bạn bè
            const isFriend = await FriendShip.findOne({ users: { $all: [senderId, receiverId] }, status: 'active' });
            if (isFriend) {
                return res.status(409).json({
                    messageCode: 'friend_already',
                    message: 'Your are friend already',
                });
            }
            //Trường hợp đã gửi request trước đó
            const isRequestExist = await FriendRequest.findOne({
                sender: senderId,
                receiver: receiverId,
                status: 'pending',
            });
            console.log('isRequestExist: ', isRequestExist);
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
                        sender: receiverId,
                        receiver: senderId,
                    },
                ],
            });
            if (request?.status === 'pending') {
                const updateRequest = await FriendRequest.findByIdAndUpdate(request?._id, { status: 'accepted' });
                const friendShip = await FriendShip.create({
                    users: [senderId, receiverId],
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
                receiver: receiverId,
                status: 'pending',
            });
            addFriendRequest = await addFriendRequest.populate('sender', '-password');
            addFriendRequest = await addFriendRequest.populate('receiver', '-password');
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

            const friendRequest = await FriendRequest.findOne({
                requestId,
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
            const updateRequest = FriendRequest.findByIdAndUpdate(requestId, {
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
            const { requestId } = req.query;
            const receiverId = req.user.data;
            const friendRequest = await FriendRequest.findOne({
                _id: requestId,
            });
            if (String(friendRequest.receiver) !== receiverId) {
                return res.status(200).json({
                    message: MESSAGE.NO_PERMISSION_ACCEPT_REQUEST,
                    messageCode: 'no_permission_accept_request',
                    status: MESSAGE_CODE.NO_PERMISSION_ACCEPT_REQUEST,
                });
            }
            console.log('request: ', friendRequest);
            const isFriend = await FriendShip.findOne({
                users: { $all: [friendRequest?.sender, friendRequest?.receiver] },
                status: 'active',
            });
            console.log('isFriend: ', isFriend);
            if (isFriend) {
                await FriendRequest.findByIdAndUpdate(
                    { _id: requestId, status: 'pending' },
                    {
                        status: 'cancel',
                    },
                );
                return res.status(409).json({
                    messageCode: 'already_friend',
                    message: MESSAGE.ALREADY_FRIEND,
                });
            }
            const updateRequest = await FriendRequest.findByIdAndUpdate(requestId, {
                status: 'accepted',
            });
            const updateFriendShip = await FriendShip.create({
                users: [receiverId, friendRequest.sender],
                status: 'active',
                friendRequest: requestId,
            });

            return res.status(201).json({
                message: MESSAGE.ACCEPT_FRIEND_SUCCESS,
                messageCode: 'accept_friend_successfully',
                data: updateFriendShip,
            });
        } catch (error) {
            next(error);
        }
    },
    rejectFriendRequest: async (req, res, next) => {
        const { requestId } = req.query;
        const receiverId = req.user.data;

        if (!mongodb.ObjectId.isValid(receiverId) || !mongodb.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }
        const friendRequest = await FriendRequest.findOne({
            _id: requestId,
        });
        if (String(friendRequest.receiver) !== receiverId) {
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
                { _id: requestId, status: 'pending' },
                {
                    status: 'cancel',
                },
            );
            return res.status(409).json({
                messageCode: 'already_friend',
                message: MESSAGE.ALREADY_FRIEND,
            });
        }
        const updateRequest = await FriendRequest.findByIdAndUpdate(requestId, {
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
        const { requestId } = req.query;
        const senderId = req.user.data;

        if (!mongodb.ObjectId.isValid(senderId) || !mongodb.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }
        const friendRequest = await FriendRequest.findOne({
            _id: requestId,
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
                { _id: requestId, status: 'pending' },
                {
                    status: 'cancel',
                },
            );
            return res.status(409).json({
                messageCode: 'already_friend',
                message: MESSAGE.ALREADY_FRIEND,
            });
        }
        const updateRequest = await FriendRequest.findByIdAndUpdate(requestId, {
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
        const userId = req.user.data;
        const requestId = req.query.requestId;
        if (!mongodb.ObjectId.isValid(userId) || !mongodb.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }

        try {
            const friendRequest = await FriendRequest.findByIdAndUpdate({ requestId }, { status: 'removed' });
            return res.status(202).json({
                message: MESSAGE.REMOVE_FRIEND_SUCCESS,
                data: friendRequest,
                messageCode: 'remove_friend_successfully',
                status: MESSAGE_CODE.REMOVE_FRIEND_SUCCESS,
            });
        } catch (error) {}
    },
};
