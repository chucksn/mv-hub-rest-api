const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const { isEmpty } = require("validator");
const mongoose = require("mongoose");

const handleErrors = (err) => {
  let errors = {};
  if (err.code === 11000) {
    if (Object.keys(err.keyValue).includes("username")) {
      errors["username"] = "Username not available";
    }

    if (Object.keys(err.keyValue).includes("email")) {
      errors["email"] = "Account with this email already exist";
    }
    return errors;
  }

  if (err.name === "ValidationError") {
    Object.values(err.errors).forEach((errorObject) => {
      const path = errorObject.properties.path;
      errors[path] = errorObject.message;
    });
    return errors;
  }
  return err;
};

//user login end-point
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  try {
    if (isEmpty(username)) {
      throw "Invalid Username";
    } else if (isEmpty(password)) {
      throw "Invalid Password";
    } else {
      User.findOne({ username: username })
        .then((user) => {
          if (user) {
            bcrypt
              .compare(password, user.password)
              .then((result) => {
                if (result) {
                  res.json({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    watchlist: user.watchlist,
                  });
                } else {
                  throw "Incorrect Username or Password";
                }
              })
              .catch((error) => res.json({ error }));
          } else {
            throw "Incorrect Username or Password ";
          }
        })
        .catch((err) => res.json({ err }));
    }
  } catch (error) {
    res.json({ error });
  }
});

//user sign-up end-point
router.post("/sign-up", (req, res) => {
  const { name, email, username, password } = req.body;
  const user = new User({
    email,
    name,
    password,
    username,
  });
  user
    .save()
    .then((user) => {
      res.status(201).json({ message: "Account created" });
    })
    .catch((err) => {
      const error = handleErrors(err);
      res.status(400).json({ error });
    });
});

//update watchlist end-point
router.put("/:userId/watchlist", (req, res) => {
  const { userId } = req.params;
  const newWatchlist = req.body;
  User.updateOne({ _id: userId }, { $push: { watchlist: newWatchlist } })
    .then((result) => {
      if (result.modifiedCount) {
        res.json({ message: "New item added to watchlist" });
      }
      if (!result.matchedCount) throw "User does not exist";
    })
    .catch((err) => res.status(400).json({ error: err }));
});

//delete watchlist end-point
router.delete("/:userId/watchlist/:watchlistId", (req, res) => {
  const { userId, watchlistId } = req.params;
  User.findOne({ _id: userId, "watchlist._id": watchlistId })
    .then((result) => {
      if (!result) {
        throw "watchlist item does not exist";
      }
      return User.updateOne(
        { _id: userId },
        { $pull: { watchlist: { _id: watchlistId } } }
      )
        .then((result) => {
          if (result.modifiedCount) {
            res.json({ message: "Item deleted from watchlist" });
          }
          if (!result.matchedCount) throw "User does not exist";
        })
        .catch((err) => res.status(400).json({ error: err }));
    })
    .catch((err) => res.status(400).json({ error: err }));
});

module.exports = router;
