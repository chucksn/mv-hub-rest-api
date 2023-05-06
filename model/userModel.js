const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const WatchlistItemSchema = new mongoose.Schema({}, { strict: false });

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      lowercase: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
      validate: [isEmail, "Enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Minimum password length is 8 characters"],
    },
    watchlist: [WatchlistItemSchema],
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const saltRound = 10;
  bcrypt.hash(this.password, saltRound).then((hash) => {
    this.password = hash;
    next();
  });
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
