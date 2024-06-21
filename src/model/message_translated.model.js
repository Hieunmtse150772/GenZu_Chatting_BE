const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const MessageTranslatedSchema = mongoose.Schema(
    {
        message_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'message',
            required: true
        },
        participant_id: {
            ref: 'participant',
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        type_room: {
            type: String,
            required: true
        },
        back_ground: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('message_translated', MessageTranslatedSchema);
