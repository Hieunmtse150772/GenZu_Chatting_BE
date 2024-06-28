const Joi = require('joi');

const signUp = Joi.object({
    id: Joi.string(),
    fullName: Joi.string().min(2).required(),
    address: Joi.string().min(2).required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    picture: Joi.string().required(),
    email: Joi.string().pattern(new RegExp('gmail.com$')).email().required(),
    password: Joi.string().min(6).max(30).required(),
});

const signIn = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
});

const changePassword = Joi.object({
    oldPassword: Joi.string().min(6).max(30).required(),
    newPassword: Joi.string().min(6).max(30).required(),
});

const forgotPassword = Joi.object({
    email: Joi.string().pattern(new RegExp('gmail.com$')).email().required(),
});

const verifyForgotPassword = Joi.object({
    token: Joi.string(),
    newPassword: Joi.string().min(6).max(30).required(),
});

module.exports = {
    signUp,
    signIn,
    changePassword,
    forgotPassword,
    verifyForgotPassword,
};
