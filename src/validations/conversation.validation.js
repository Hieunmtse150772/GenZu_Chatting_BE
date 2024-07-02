const Joi = require('joi');

const accessConversation = Joi.object({
    id: Joi.string().required(),
});

const fetchConversation = Joi.object({
    id: Joi.string().required(),
    message: Joi.string().min(1).required(),
    //   sender_id: Joi.string().required(),
    //   conversation_id: Joi.string().required(),
    //   message_type: Joi.string().required(),
    //   status: Joi.string().required(),
});

module.exports = {
    accessConversation,
    fetchConversation,
};
