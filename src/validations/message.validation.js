const Joi = require('joi');

const getMessages = Joi.object({
    id: Joi.string().required(),
    limit: Joi.number(),
    search: Joi.string(),
});

const sendMessage = Joi.object({
    id: Joi.string().required(),
    message: Joi.string().min(1).required(),
    isSpoiled: Joi.string(),
    messageType: Joi.string(),
    styles: Joi.object({
        fontSize: Joi.number(),
        bold: Joi.boolean(),
        italic: Joi.boolean(),
        underline: Joi.boolean(),
    }),
    //   sender_id: Joi.string().required(),
    //   conversation_id: Joi.string().required(),
    //   message_type: Joi.string().required(),
    //   status: Joi.string().required(),
});

module.exports = {
    getMessages,
    sendMessage,
};
