const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const MessageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
        },
        message_type: {
            type: String,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
        },
        deleteBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('Message', MessageSchema);
