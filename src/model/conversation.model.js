const mongoose = require('mongoose');

const connection = require('../connections/mongodb');
const Message = require('./message.model');

const ConversationSchema = mongoose.Schema(
    {
        chatName: { type: String, trim: true },
        avatar: { type: String, default: null },
        background: { type: String, default: null },
        isGroupChat: { type: Boolean, default: false },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        deleteBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        status: { type: mongoose.Schema.Types.ObjectId },
    },
    {
        timestamps: true,
    },
);

ConversationSchema.pre('remove', async function (next) {
    try {
        await Message.deleteMany({ conversation: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = connection.model('Conversation', ConversationSchema);
