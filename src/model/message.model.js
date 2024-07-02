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
            enum: ['text', 'image', 'notification'],
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
        },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        invitedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('Message', MessageSchema);
