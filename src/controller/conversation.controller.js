const mongodb = require('mongodb');

const Conversation = require('../model/conversation.model');
const Message = require('../model/message.model');
const User = require('../model/user.model');

module.exports = {
  accessConversation: async (req, res, next)=>{
    console.log('req: ', req.body)
    const { userId } = req.body;

    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }
  
    var isChat = await Conversation.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
  
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
  
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
  
      try {
        const createdChat = await Conversation.create(chatData);
        const FullChat = await Conversation.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        res.status(200).json(FullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  },
  getConversations: async (req, res, next) => {
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
  fetchConversation: async (req, res, next) => {
    try {
      console.log('req.user._id : ', req.user._id )
      Conversation.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate('users', '-password')
        .populate('groupAdmin', '-password')
        .populate('latestMessage')
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: 'latestMessage.sender_id',
            select: 'fullName picture email',
          });
          // res.status(200).json({
          //   message: 'Get conversations was successfully',
          //   messageCode: 'get_conversations_successfully',
          //   data: results,
          // });
          res.status(200).send(results);

        });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  },
  sendMessage: async (req, res, next) => {
    try {
      const receiverId = req.params.id;

      if (!mongodb.ObjectId.isValid(receiverId)) {
        return res.status(400).json({
          message: 'The receiverId is invalid',
          messageCode: 'invalid_receiverId',
        });
      }
      const senderId = req.user.data;
      const { message } = req.body;

      let conversation = await Conversation.findOne({
        paticipants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          paticipants: [senderId, receiverId],
        });
      }

      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
      });

      if (newMessage) {
        conversation.messages.push(newMessage._id);
      }

      await conversation.save();

      return res.status(201).json({
        message: 'Message sent successfully',
        messageCode: 'sent_successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  },
};
