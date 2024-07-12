const Joi = require('joi');
const { objectIdValidator } = require('@/utils/functions');

const getMessages = Joi.object({
    id: Joi.string().required().custom(objectIdValidator, 'ObjectId validation'),
    limit: Joi.number(),
    messageId: Joi.string(),
    search: Joi.string(),
    page: Joi.number(),
    startDate: Joi.date(),
    endDate: Joi.date(),
});

const searchMessages = Joi.object({
    id: Joi.string().required().custom(objectIdValidator, 'ObjectId validation'),
    sender: Joi.string().custom(objectIdValidator, 'ObjectId validation'),
    search: Joi.string(),
});

const sendMessage = Joi.object({
    message: Joi.string().min(1).required(),
    isSpoiled: Joi.boolean(),
    messageType: Joi.string().valid('text', 'image', 'video', 'notification', 'file', 'audio'),
    styles: Joi.object({
        fontSize: Joi.number(),
        bold: Joi.boolean(),
        italic: Joi.boolean(),
        underline: Joi.boolean(),
    }),
    emojiBy: Joi.array(),
});

const sendMessage2 = Joi.object({
    conversationId: Joi.string().required().custom(objectIdValidator, 'ObjectId validation'),
    message: Joi.string().min(1).required(),
    isSpoiled: Joi.boolean(),
    messageType: Joi.string().valid('text', 'image', 'video', 'notification', 'file', 'audio'),
    styles: Joi.object({
        fontSize: Joi.number(),
        bold: Joi.boolean(),
        italic: Joi.boolean(),
        underline: Joi.boolean(),
    }),
    emojiBy: Joi.array(),
});

const sendEmoji = Joi.object({
    emoji: Joi.string().required(),
});
const updateEmoji = Joi.object({
    newEmoji: Joi.string().required(),
});
module.exports = {
    getMessages,
    sendMessage,
    sendEmoji,
    updateEmoji,
    searchMessages,
    sendMessage2,
};
