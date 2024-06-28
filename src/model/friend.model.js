const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const FriendSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
        receiver: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
        status: { type: String, required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('Friend', FriendSchema);
