const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const connection = require('../connections/mongodb');
const { hashText } = require('../utils/functions');

const UserSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        gender: { type: String, enum: ['male', 'female'] },
        email: { type: String, require: true, unique: true },
        password: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

UserSchema.pre('save', function (next) {
    try {
        const hashPassword = hashText(this.password, 10);

        this.password = hashPassword;
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = connection.model('user', UserSchema);
