const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const MessageDeletedSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        message_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'message',
            required: true,
        },
        status: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('message_deleted', MessageDeletedSchema);
