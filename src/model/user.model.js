const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const connection = require('../connections/mongodb');
const { hashText } = require('../utils/functions');

const UserSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, default: null },
        address: { type: String, default: null },
        gender: { type: String, enum: ['male', 'female', 'other'], default: null },
        email: {
            type: String,
            require: true,
            unique: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please provide a valid email',
            ],
        },
        socketId: [{ type: String, default: [] }],
        googleId: { type: String, default: null },
        email_verified: { type: Boolean, default: false },
        tokenGoogle: { type: Object, default: null },
        password: { type: String, require: true, default: null },
        phone_number: { type: String, default: null },
        role_id: { type: String, ref: 'role', default: null },
        picture: { type: String, require: true, default: null },
        is_active: { type: Boolean, default: true },
        is_online: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

UserSchema.pre('save', function (next) {
    try {
        if (this.password) {
            const hashPassword = hashText(this.password, 10);

            this.password = hashPassword;
        }
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = connection.model('User', UserSchema);
