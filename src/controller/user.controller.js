const User = require('../model/user.model');

module.exports = {
  getUserForSidebar: async (req, res, next) => {
    try {
      const id = req.user.data;
      console.log(' req.user.data: ', req.user.data);
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
      const user = await User.find(keyword).find({
        _id: { $ne: req.user._id },
      });
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
