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
      const target_id = req.params.id;

      if (!mongodb.ObjectId.isValid(target_id)) {
        return res.status(400).json({
          message: 'The user id is invalid',
          messageCode: 'invalid_userId',
        });
      }

      const sender_id = req.user.data;
      5;
      const newMessage = await Friend.create({
        sender_id,
        target_id,
      });

      return res.status(201).json({
        message: 'Send add friend request successfully',
        messageCode: 'sent_add_friend_successfully',
        data: newMessage,
      });
    } catch (error) {
      next(error);
    }
  },
};
