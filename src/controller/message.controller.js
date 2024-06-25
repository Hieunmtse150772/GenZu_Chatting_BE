const mongodb = require('mongodb');

const Conversation = require('../model/conversation.model');
const Message = require('../model/message.model');
const User = require('../model/user.model');
module.exports = {
  getMessages: async (req, res, next) => {
    try {
      const conversation_id = req.params.id;
      console.log('conversation_id: ', conversation_id);
      const message = await Message.find({
        conversation: conversation_id,
      })
        .populate('sender')
        .populate('conversation');
      console.log('message: ', message);
      if (!message) {
        return res.status(200).json({
          message: 'Get message was successfully',
          messageCode: 'sent_successfully',
          data: [],
        });
      }
      return res.status(200).json({
        message: 'Get message was successfully',
        messageCode: 'sent_successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  },
  sendSingleMessage: async (req, res, next) => {
    console.log('req: ', req.user);

    const { message, id } = req.body;

    if (!message || !id) {
      console.log('Invalid data passed into request');
      return res.sendStatus(400);
    }
    console.log('req: ', req.user.data);

    var messageCreated = {
      sender: req.user.data,
      message: message,
      conversation: id,
      status: 'active',
      message_type: 'single',
    };
    console.log('messageCreated: ', messageCreated);
    try {
      var newMessage = await Message.create(messageCreated);
      newMessage = await newMessage.populate(
        'sender',
        'fullName picture email'
      );
      newMessage = await newMessage.populate('conversation');
      newMessage = await User.populate(newMessage, {
        path: 'conversation.users',
        select: 'fullName picture email',
      });
      console.log('newMessage 4: ', newMessage);
      await Conversation.findByIdAndUpdate(req.body.id, {
        latestMessage: newMessage,
      });

      res.json(newMessage);
    } catch (error) {
      next(error);
    }
  },
  // sendMessage: async (req, res, next) => {
  //   try {
  //     const conversation_id = req.params.id;
  //     if (!mongodb.ObjectId.isValid(conversation_id)) {
  //       return res.status(400).json({
  //         message: 'The conversation id is invalid',
  //         messageCode: 'invalid_conversation_id',
  //       });
  //     }
  //     const senderId = req.user.data;
  //     const { message } = req.body;
  //     // let conversation = await Conversation.findOne({
  //     //   id: conversation_id,
  //     // });
  //     // if (!conversation) {
  //     //   conversation = new Conversation({
  //     //     participants: [senderId, receiverId],
  //     //   });
  //     // }
  //     // const newMessage = await Message.create({
  //     //   senderId,
  //     //   receiverId,
  //     //   message,
  //     // });
  //     // if (newMessage) {
  //     //   conversation.messages.push(newMessage._id);
  //     // }
  //     // await conversation.save();
  //     return res.status(201).json({
  //       message: 'Message sent successfully',
  //       messageCode: 'sent_successfully',
  //       data: message,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // },
};
