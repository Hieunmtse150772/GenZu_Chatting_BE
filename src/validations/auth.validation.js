const Joi = require('joi');

const signUpBody = Joi.object({
    fullName: Joi.string().min(2).required(),
    address: Joi.string().min(2).required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    picture: Joi.string().required(),
    email: Joi.string().pattern(new RegExp('gmail.com$')).email().required(),
    password: Joi.string().min(6).max(30).required(),
});

const signInBody = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
});

const changePasswordBody = Joi.object({
    oldPassword: Joi.string().min(6).max(30).required(),
    newPassword: Joi.string().min(6).max(30).required(),
});

const forgotPasswordBody = Joi.object({
    email: Joi.string().pattern(new RegExp('gmail.com$')).email().required(),
});

const verifyForgotPasswordBody = Joi.object({
    token: Joi.string(),
    newPassword: Joi.string().min(6).max(30).required(),
});

module.exports = {
    signUpBody,
    signInBody,
    changePasswordBody,
    forgotPasswordBody,
    verifyForgotPasswordBody,
};
