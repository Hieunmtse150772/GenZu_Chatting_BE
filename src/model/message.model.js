const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const MessageSchema = mongoose.Schema(
    {
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        conversation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        message_type: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required:true
        },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('message', MessageSchema);
