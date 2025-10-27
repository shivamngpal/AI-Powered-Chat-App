// stores email/pass/name of users
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    profilePic: { type: String, default: "" },
    about: { type: String, default: "Hey there! I am using VachChat 💬" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", User);

module.exports = UserModel;
