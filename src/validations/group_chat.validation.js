const Joi = require('joi');

const { objectIdValidator, arrayUniqueValidator, arrayUniqueCreateGroupValidator } = require('@/utils/functions');

const createGroupBody = Joi.object({
    chatName: Joi.string().min(1).required(),
    avatar: Joi.string().optional(),
    background: Joi.string().optional(),
    users: Joi.array()
        .min(2)
        .items(Joi.string().custom(objectIdValidator, 'ObjectId validation'))
        .custom(arrayUniqueCreateGroupValidator, 'Array unique validation'),
});

const addMemberGroupBody = Joi.object({
    users: Joi.array()
        .items(Joi.string().custom(objectIdValidator, 'ObjectId validation'))
        .custom(arrayUniqueValidator, 'Array unique validation'),
});

const updateGroupBody = Joi.object({
    chatName: Joi.string().min(1),
    avatar: Joi.string().min(1),
    background: Joi.string(),
});

const deleteMemberGroupBody = Joi.object({
    memberId: Joi.string().required().custom(objectIdValidator, 'ObjectId validation'),
    exchangeAdmin: Joi.string().custom(objectIdValidator, 'ObjectId validation'),
});

module.exports = {
    createGroupBody,
    addMemberGroupBody,
    updateGroupBody,
    deleteMemberGroupBody,
};
