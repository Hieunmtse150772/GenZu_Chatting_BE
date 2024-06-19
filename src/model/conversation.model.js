const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const ConversationSchema = mongoose.Schema(
    {
        paticipants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'message',
                default: [],
            },
        ],
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('conversation', ConversationSchema);
