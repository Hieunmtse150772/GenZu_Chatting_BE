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
        messageType: {
            type: String,
            enum: ['text', 'image', 'notification'],
        },
        isSpoiled: {
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
        emojiBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Emoji' }],
        styles: {
            fontSize: {
                type: Number,
            },
            bold: {
                type: Boolean,
            },
            italic: {
                type: Boolean,
            },
            underline: {
                type: Boolean,
            },
        },
        invitedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('Message', MessageSchema);
