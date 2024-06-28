const mongodb = require('mongodb');

const Conversation = require('../model/conversation.model');
const Message = require('../model/message.model');
const User = require('../model/user.model');
module.exports = {
    getAllMessages: async (req, res, next) => {
        try {
            console.log('req.user: ', req.user.data);
            const conversation_id = req.params.id;
            const message = await Message.find({
                conversation: conversation_id,
            })
                .populate('sender', '_id fullName picture')
                .populate('conversation');
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
    getAllMessagePagination: async (req, res, next) => {
        if (res?.paginatedResults) {
            const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;
            const responseObject = {
                totalDocs: totalDocs || 0,
                totalPages: totalPages || 0,
                lastPage: lastPage || 0,
                count: results?.length || 0,
                currentPage: currentPage || 0,
            };

            if (next) {
                responseObject.nextPage = next;
            }
            if (previous) {
                responseObject.prevPage = previous;
            }

            responseObject.Messages = results?.map((Messages) => {
                const { user, ...otherMessageInfo } = Messages._doc;
                return {
                    ...otherMessageInfo,
                    request: {
                        type: 'Get',
                        description: '',
                    },
                };
            });

            return res.status(200).send({
                success: true,
                error: false,
                message: 'Successful found message',
                status: 200,
                data: responseObject,
            });
        }
    },
    sendSingleMessage: async (req, res, next) => {
        const { message, id } = req.body;

        if (!message || !id) {
            console.log('Invalid data passed into request');
            return res.sendStatus(400);
        }

        var messageCreated = {
            sender: req.user.data,
            message: message,
            conversation: id,
            status: 'active',
            message_type: 'single',
        };
        try {
            var newMessage = await Message.create(messageCreated);
            newMessage = await newMessage.populate('sender', 'fullName picture email');
            newMessage = await newMessage.populate('conversation');
            newMessage = await User.populate(newMessage, {
                path: 'conversation.users',
                select: 'fullName picture email',
            });
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
    //     const senderId = req.user._id ;
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
