const mongodb = require('mongodb');

const Conversation = require('../model/conversation.model');
const Message = require('../model/message.model');

module.exports = {
    getMessages: async (req, res, next) => {
        try {
            const receiverId = req.params.id;

            if (!mongodb.ObjectId.isValid(receiverId)) {
                return res.status(400).json({
                    message: 'The receiverId is invalid',
                    messageCode: 'invalid_receiverId',
                });
            }
            const senderId = req.user.data;

            const conversation = await Conversation.findOne({ paticipants: { $all: [senderId, receiverId] } }).populate(
                'messages',
            );

            if (!conversation) {
                return res.status(200).json({
                    message: 'Get message was successfully',
                    messageCode: 'sent_successfully',
                    data: [],
                });
            }
            return res.status(200).json({
                message: 'Get message was successfully',
                messageCode: 'sent_successfully',
                data: conversation.messages,
            });
        } catch (error) {
            next(error);
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

            let conversation = await Conversation.findOne({ paticipants: { $all: [senderId, receiverId] } });

            if (!conversation) {
                conversation = new Conversation({ paticipants: [senderId, receiverId] });
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
