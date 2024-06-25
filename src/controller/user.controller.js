const mongodb = require('mongodb');

const User = require('../model/user.model');

module.exports = {
    updateProfile: async (req, res, next) => {
        try {
            const id = req.params.id;
            if (!mongodb.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: 'The user id is invalid',
                    messageCode: 'invalid_userId',
                    status: 400,
                    success: false,
                });
            }

            const user = await User.findByIdAndUpdate({ _id: id }, req.body, {
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
            const id = req.user.data;
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
            const user = await User.find(keyword).find({ _id: { $ne: req.user._id } });
            res.status(200).json({
                message: 'Search user successfully',
                messageCode: 'search_user_successfully',
                user,
            });
        } catch (error) {
            next(error);
        }
    },
};
