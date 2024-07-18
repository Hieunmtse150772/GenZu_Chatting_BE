const mongodb = require('mongodb');

const User = require('../model/user.model');

const FriendShip = require('../model/friendShip.model');

const Conversation = require('../model/conversation.model');

module.exports = {
    updateProfile: async (req, res, next) => {
        try {
            const user = await User.findByIdAndUpdate({ _id: req.user._id }, req.body, {
                new: true,
            }).select('-password');

            if (!user) {
                return res.status(404).json({
                    message: 'The user not found',
                    messageCode: 'user_not_found',
                    status: 404,
                    success: false,
                });
            }

            res.status(200).json({
                message: 'Get user for sidebar successfully',
                messageCode: 'get_user_successfully',
                user,
                status: 200,
                success: true,
            });
        } catch (error) {
            next(error);
        }
    },
    getUserForSidebar: async (req, res, next) => {
        try {
            const id = req.user._id;
            const users = await User.find({ _id: { $ne: id } }).select('-password');

            res.status(200).json({
                message: 'Get user for sidebar successfully',
                messageCode: 'get_user_successfully',
                users,
            });
        } catch (error) {
            next(error);
        }
    },
    getUserByKeyWord: async (req, res, next) => {
        try {
            const keyword = req.query.search
                ? {
                      $or: [
                          { fullName: { $regex: req.query.search, $options: 'i' } },
                          { email: { $regex: req.query.search, $options: 'i' } },
                      ],
                  }
                : {};
            console.log('keyword: ', keyword);
            const user = await User.find(keyword)
                .find({ _id: { $ne: req.user._id } })
                .select('fullName picture email gender');
            res.status(200).json({
                message: 'Search user successfully',
                messageCode: 'search_user_successfully',
                user,
            });
        } catch (error) {
            next(error);
        }
    },
    getUserById: async (req, res, next) => {
        try {
            const userId = req.user._id;
            const id = req.query.userId;
            if (!mongodb.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                });
            }
            const user = await User.findOne({ _id: id }, 'fullName email picture');

            const relationShip = await FriendShip.findOne({
                users: { $all: [id, req.user._id] },
                status: 'active',
            });
            const conversation = await Conversation.find({
                $and: [{ users: { $elemMatch: { $eq: id } } }, { users: { $elemMatch: { $eq: userId } } }],
            })
                .populate('users', '_id fullName email picture')
                .populate('latestMessage');

            return res.status(200).json({
                message: 'Search user successfully',
                messageCode: 'search_user_successfully',
                user,
                conversation: conversation,
                relationShip: relationShip ? relationShip : 'Not a friend yet',
            });
        } catch (error) {
            next(error);
        }
    },
    getBlockUser: async (req, res, next) => {
        const userId = req.user._id;
        try {
            const blockListUser = await User.findOne({ _id: userId })
                .select('blockedUsers')
                .populate('blockedUsers', 'fullName picture email');

            return res
                .status(200)
                .json(
                    createResponse(
                        blockListUser,
                        STATUS_MESSAGE.BLOCK_USER_SUCCESSFULLY,
                        MESSAGE_CODE.BLOCK_USER_SUCCESSFULLY,
                        true,
                    ),
                );
        } catch (error) {}
    },
    blockUser: async (req, res, next) => {
        const userId = req.user._id;
        const userBlockId = req.query.blockUserId;
        try {
            const userBlocked = await User.findById({ _id: userBlockId });
            if (!userBlocked) {
                return res
                    .status(400)
                    .json(createResponse(null, STATUS_MESSAGE.USER_NOT_FOUND, MESSAGE_CODE.USER_NOT_FOUND, false));
            }

            if (userBlocked?.blockedUsers?.includes(userBlockId)) {
                return res
                    .status(403)
                    .json(
                        createResponse(
                            null,
                            STATUS_MESSAGE.USER_AlREADY_BLOCKED,
                            MESSAGE_CODE.USER_AlREADY_BLOCKED,
                            false,
                        ),
                    );
            }

            const userUpdate = await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $push: { blockedUsers: [userBlockId] },
                },
                {
                    new: true,
                },
            );

            return res
                .status(200)
                .json(
                    createResponse(
                        userUpdate,
                        STATUS_MESSAGE.BLOCK_USER_SUCCESSFULLY,
                        MESSAGE_CODE.BLOCK_USER_SUCCESSFULLY,
                        true,
                    ),
                );
        } catch (error) {}
    },
    unBlockUser: async (req, res, next) => {
        const userId = req.user._id;
        const conversationId = req.query.id;
        const userBlockId = req.query.blockUserId;
        try {
            const userBlocked = await User.findById({ _id: userBlockId });
            if (!userBlocked) {
                return res
                    .status(400)
                    .json(createResponse(null, STATUS_MESSAGE.USER_NOT_FOUND, MESSAGE_CODE.USER_NOT_FOUND, false));
            }

            if (userBlocked?.blockedUsers?.includes(userBlockId)) {
                return res
                    .status(403)
                    .json(
                        createResponse(
                            null,
                            STATUS_MESSAGE.USER_AlREADY_BLOCKED,
                            MESSAGE_CODE.USER_AlREADY_BLOCKED,
                            false,
                        ),
                    );
            }

            const userUpdate = await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $pull: { blockedUsers: [userBlockId] },
                },
                {
                    new: true,
                },
            );

            return res
                .status(200)
                .json(
                    createResponse(
                        userUpdate,
                        STATUS_MESSAGE.BLOCK_USER_SUCCESSFULLY,
                        MESSAGE_CODE.BLOCK_USER_SUCCESSFULLY,
                        true,
                    ),
                );
        } catch (error) {}
    },
};
