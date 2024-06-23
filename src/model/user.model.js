const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const connection = require('../connections/mongodb');
const { hashText } = require('../utils/functions');

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String },
    gender: { type: String, enum: ['male', 'female'] },
    email: {
      type: String,
      require: true,
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
    },
    password: { type: String, require: true },
    phone_number: { type: String },
    role_id: { type: String, ref: 'role' },
    picture: { type: String, require: true },
    is_active: { type: Boolean },
    is_online: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', function (next) {
  try {
    const hashPassword = hashText(this.password, 10);

    this.password = hashPassword;
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = connection.model('User', UserSchema);
