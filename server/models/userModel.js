// stores email/pass/name of users
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema(
  {
    email: { type: String, unique: true },
    password: String,
    name: String,
  },
  { timestamps: true }
);

const UserModel = mongoose.model('users',User);

module.exports = UserModel;