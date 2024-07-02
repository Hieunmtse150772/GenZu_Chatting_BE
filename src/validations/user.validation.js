const Joi = require('joi');

const updateProfileBody = Joi.object({
    fullName: Joi.string(),
    email: Joi.string().pattern(new RegExp('gmail.com$')).email(),
    gender: Joi.string().valid('male', 'female', 'other'),
    address: Joi.string(),
    phoneNumber: Joi.string(),
    picture: Joi.string(),
});

module.exports = {
    updateProfileBody,
};
