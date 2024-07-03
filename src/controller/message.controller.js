const mongodb = require('mongodb');
const MESSAGE = require('@/enums/message.enum.js');
const Conversation = require('../model/conversation.model');
const Message = require('@/model/message.model');
const User = require('@/model/user.model');
const Emoji = require('@/model/emoji.model');
const MESSAGE_CODE = require('@/enums/messageCode.enum');
module.exports = {
    getAllMessages: async (req, res, next) => {
        try {
            const userId = req.user._id;
            const conversation_id = req.params.id;
            const message = await Message.find({
                conversation: conversation_id,
                status: 'active',
                deleteBy: { $nin: userId },
            })
                .populate('sender', '_id fullName picture')
                .populate('conversation')
                .populate({
                    path: 'emojiBy',
                    populate: {
                        path: 'sender',
                        select: 'fullName _id status',
                    },
                });
            if (!message) {
                return res.status(200).json({
                    message: 'Get message was successfully',
                    messageCode: 'get_message_successfully',
                    data: [],
                });
            }
            return res.status(200).json({
                message: 'Get message was successfully',
                messageCode: 'get_message_successfully',
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
    searchMessages: async (req, res, next) => {
        if (res?.paginatedResults) {
            const { results, totalDocs, totalPages } = res.paginatedResults;
            const responseObject = {
                totalDocs: totalDocs || 0,
                totalPages: totalPages || 0,
                count: results?.length || 0,
            };

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
        const { message, messageType, isSpoiled, styles } = req.body;
        const conversationId = req.query.id;
        var messageCreated = {
            sender: req.user._id,
            message: message,
            conversation: conversationId,
            isSpoiled: isSpoiled,
            status: 'active',
            messageType: messageType,
            styles: styles,
        };
        try {
            var newMessage = await Message.create(messageCreated);
            newMessage = await newMessage.populate('sender', 'fullName picture email');
            newMessage = await newMessage.populate('conversation');
            newMessage = await User.populate(newMessage, {
                path: 'conversation.users',
                select: 'fullName picture email',
            });
            await Conversation.findByIdAndUpdate(
                conversationId,
                {
                    latestMessage: newMessage._id,
                },
                { new: true },
            );

            return res.status(201).json({
                success: true,
                message: 'Send message success',
                newMessage,
            });
        } catch (error) {
            next(error);
        }
    },
    deleteMessage: async (req, res, next) => {
        const messageId = req.query.id;
        const userId = req.user._id;
        try {
            console.log('messageId: ', messageId);
            console.log('userId: ', userId);

            const messageUpdate = await Message.findByIdAndUpdate(
                messageId,
                { $push: { deleteBy: userId } },
                { new: true, useFindAndModify: false },
            );
            return res.status(200).json({
                message: MESSAGE.DELETE_MESSAGE_SUCCESS,
                data: messageUpdate,
            });
        } catch (error) {
            next(error);
        }
    },
    deleteAllMessage: async (req, res, next) => {
        const userId = req.user._id;
        try {
            const messageUpdate = await Message.updateMany({}, { status: 'deleted' });
            return res.status(200).json({
                message: MESSAGE.DELETE_MESSAGE_SUCCESS,
                data: messageUpdate,
            });
        } catch (error) {
            next(error);
        }
    },
    recallMessage: async (req, res, next) => {
        const messageId = req.query.id;
        const userId = req.user._id;
        try {
            const message = Message.findOne(messageId);
            if (message.sender !== userId) {
                return res.status(200).json({
                    message: MESSAGE.NO_PERMISSION_RECALL_MESSAGE,
                    messageCode: 'no_permission_recall_message',
                    status: MESSAGE_CODE.NO_PERMISSION_RECALL_MESSAGE,
                });
            }
            const messageUpdate = Message.findByIdAndUpdate(messageId, { status: 'recalled' });
            return res.status(200).json({
                message: MESSAGE.RECALL_MESSAGE_SUCCESS,
                data: messageUpdate,
            });
        } catch (error) {
            next(error);
        }
    },
    addEmojiMessage: async (req, res, next) => {
        const { emoji } = req.body;
        const messageId = req.query.id;
        const userId = req.user._id;
        if (!mongodb.ObjectId.isValid(messageId)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }
        try {
            const addEmoji = await Emoji.create({
                sender: userId,
                emoji: emoji,
                status: 'active',
            });
            const addEmojiMessage = await Message.findByIdAndUpdate(
                messageId,
                {
                    $push: { emojiBy: addEmoji._id },
                },
                { new: true, useFindAndModify: false },
            ).populate({
                path: 'emojiBy',
                populate: {
                    path: 'sender',
                    select: 'fullName _id',
                },
            });
            return res.status(201).json({
                message: MESSAGE.ADD_EMOJI_MESSAGE_SUCCESS,
                data: addEmojiMessage,
            });
        } catch (error) {
            return next(error);
        }
    },
    updateEmojiMessage: async (req, res, next) => {
        const { newEmoji } = req.body;
        const { id } = req.query;
        const userId = req.user._id;
        if (!mongodb.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }
        try {
            const emoji = await Emoji.findOne({ _id: id });
            console.log('emoji: ', emoji);
            if (!emoji) {
                return res.status(200).json({
                    message: 'Emoji has been remove',
                    status: 200,
                });
            }
            if (String(userId) !== String(emoji.sender)) {
                return res.status(409).json({
                    message: MESSAGE.NOT_YOUR_EMOJI,
                    status: MESSAGE_CODE.NOT_YOUR_EMOJI,
                });
            }
            const updateEmoji = await Emoji.findByIdAndUpdate(
                { _id: id },
                {
                    emoji: newEmoji,
                },
                { new: true, useFindAndModify: false },
            );
            return res.status(200).json({
                message: MESSAGE.UPDATE_EMOJI_MESSAGE_SUCCESS,
                data: updateEmoji,
            });
        } catch (error) {
            return next(error);
        }
    },
    removeEmojiMessage: async (req, res, next) => {
        const { emoji } = req.body;
        const { emojiId, id } = req.query;
        const userId = req.user._id;
        if (!mongodb.ObjectId.isValid(emojiId)) {
            return res.status(400).json({
                message: 'The id is invalid',
                messageCode: 'invalid_id',
            });
        }
        try {
            const emoji = await Emoji.findOne({ _id: emojiId });
            if (!emoji) {
                return res.status(200).json({
                    message: 'Emoji has been remove',
                    status: 200,
                });
            }
            if (String(userId) !== String(emoji.sender)) {
                return res.status(409).json({
                    message: MESSAGE.NOT_YOUR_EMOJI,
                    status: MESSAGE_CODE.NOT_YOUR_EMOJI,
                });
            }
            const updateMessage = await Message.findByIdAndUpdate(id, {
                $pull: { emojiBy: emoji._id },
            });
            const updateEmoji = await Emoji.findOneAndDelete({ _id: emojiId });
            return res.status(200).json({
                message: MESSAGE.REMOVE_EMOJI_MESSAGE_SUCCESS,
                data: updateMessage,
            });
        } catch (error) {
            return next(error);
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
