const mongoose = require('mongoose');

const connection = require('../connections/mongodb');
const { languageTranslationCodes } = require('@/enums/validates');

const MessageTranslatedSchema = mongoose.Schema(
    {
        message_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true,
        },
        translate: [{ type: Object, default: [] }],
    },
    {
        timestamps: true,
    },
);

module.exports = connection.model('message_translated', MessageTranslatedSchema);
