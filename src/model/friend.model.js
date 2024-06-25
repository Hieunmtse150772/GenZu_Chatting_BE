const mongoose = require('mongoose');

const connection = require('../connections/mongodb');

const FriendSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.ObjectId, ref: 'user', required: true },
    target_id: { type: mongoose.Schema.ObjectId, ref: 'user', required: true },
    status: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = connection.model('Friend', FriendSchema);
