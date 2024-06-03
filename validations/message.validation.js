const Joi = require('joi');

const getMessages = Joi.object({
    id: Joi.string().required(),
});

const sendMessage = Joi.object({
    id: Joi.string().required(),
    message: Joi.string().min(1).required(),
});

module.exports = {
    getMessages,
    sendMessage,
};
