const Joi = require('joi');

const getMessages = Joi.object({
    id: Joi.string().required(),
});

const sendMessage = Joi.object({
    id: Joi.string().required(),
    message: Joi.string().min(1).required(),
    sender_id: Joi.string().required(),
    conversation_id: Joi.string().required(),
    message_type: Joi.string().required(),
    message: Joi.string().required(),
    status: Joi.string().required(),
});

module.exports = {
    getMessages,
    sendMessage,
};
