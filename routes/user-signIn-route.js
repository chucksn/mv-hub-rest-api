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
router.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  try {
    if (isEmpty(username)) {
      throw "Username required";
    } else if (isEmpty(password)) {
      throw "Password required";
    } else {
      User.findOne({ username: username })
        .then((user) => {
          if (user) {
            bcrypt
              .compare(password, user.password)
              .then((result) => {
                if (result) {
                  res.status(200).json({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                  });
                } else {
                  throw "Incorrect Username or Password";
                }
              })
              .catch((error) => res.status(400).json({ error }));
          } else {
            throw "Incorrect Username or Password ";
          }
        })
        .catch((error) => res.status(400).json({ error }));
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

//user sign-up end-point
router.post("/auth/sign-up", (req, res) => {
  const { name, email, username, password } = req.body;
  const user = new User({
    email,
    name,
    password,
    username,
  });
  user
    .save()
    .then(() => {
      res.status(201).json({ message: "Account created" });
    })
    .catch((err) => {
      const error = handleErrors(err);
      res.status(400).json({ error });
    });
});

//get watchlist end-point
router.get("/:userID/watchlist", (req, res) => {
  const { userID } = req.params;

  User.findById(userID)
    .then((user) => {
      if (!user) res.status(404).json({ error: "User not found" });
      const watchlist = user.watchlist;
      res.json({ watchlist });
    })
    .catch((error) => res.status(500).json({ error }));
});

//update watchlist end-point
router.put("/:userId/watchlist", (req, res) => {
  const { userId } = req.params;
  const newWatchlist = req.body;
  const newWatchlist_id = newWatchlist.id;
  User.findOne({ _id: userId, "watchlist.id": newWatchlist_id })
    .then((watchlist_id) => {
      if (watchlist_id) {
        throw "Already added to watchlist";
      } else {
        User.updateOne({ _id: userId }, { $push: { watchlist: newWatchlist } })
          .then((result) => {
            if (result.modifiedCount) {
              res.json({ message: "New item added to watchlist" });
            }
            if (!result.matchedCount) throw "User does not exist";
          })
          .catch((err) => res.status(400).json({ error: err }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
});

//delete watchlist end-point
router.delete("/:userId/watchlist/:watchlistId", (req, res) => {
  const { userId, watchlistId } = req.params;

  User.findOne({ _id: userId, "watchlist.id": Number(watchlistId) })
    .then((result) => {
      if (!result) {
        throw "watchlist item does not exist";
      }
      return User.updateOne(
        { _id: userId },
        { $pull: { watchlist: { id: Number(watchlistId) } } }
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

//delete user end-point
router.delete("/:userID", (req, res) => {
  const { userID } = req.params;
  User.findByIdAndDelete(userID)
    .then((user) => {
      if (!user) throw "User not found";
      res.status(200).json({ message: "Account deleted" });
    })
    .catch((error) => res.status(404).json({ error }));
});

module.exports = router;
