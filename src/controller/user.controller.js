const User = require('../model/users.model');

module.exports = {
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
};
