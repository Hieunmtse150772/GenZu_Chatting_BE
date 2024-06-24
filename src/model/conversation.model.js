const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const ConversationSchema = mongoose.Schema(
    {
        chatName: { type: String, trim: true },
        isGroupChat: { type: Boolean, default: false },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        latestMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
        groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('Conversation', ConversationSchema);
