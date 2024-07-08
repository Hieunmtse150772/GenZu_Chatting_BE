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
            const conversation = Conversation.find({
                $and: [{ users: { $elemMatch: { $eq: id } } }, { users: { $elemMatch: { $eq: userId } } }],
            });

            res.status(200).json({
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
};
