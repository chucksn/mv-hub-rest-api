const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const reqAuth = require("../middleware/reqAuth");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "3d" });
};

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
    if (!username) {
      throw "Username required";
    } else if (!password) {
      throw "Password required";
    } else {
      User.findOne({ username: username })
        .then((user) => {
          if (user) {
            bcrypt
              .compare(password, user.password)
              .then((match) => {
                if (match) {
                  const token = createToken(user._id);

                  res.status(200).json({
                    token,
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
    .then(() => {
      res.status(201).json({ message: "Account created" });
    })
    .catch((err) => {
      const error = handleErrors(err);
      res.status(400).json({ error });
    });
});

//delete user end-point
router.delete("/", reqAuth, (req, res) => {
  const userId = req.userId;
  User.findByIdAndDelete(userId)
    .then((user) => {
      if (!user) throw "User not found";
      res.status(200).json({ message: "Account deleted" });
    })
    .catch((error) => res.status(404).json({ error }));
});

module.exports = router;
