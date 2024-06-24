const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const ConversationDeletedSchema = mongoose.Schema(
    {
        conversation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'conversation',
            required: true
        },
        user_id: {
            type: String,
            ref: 'user',
            required: true
        },
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('Conversation_deleted', ConversationDeletedSchema);
