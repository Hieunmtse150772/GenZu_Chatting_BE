const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const MessageSchema = mongoose.Schema(
    {
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        conversation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'conversation',
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
        }
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('message', MessageSchema);
