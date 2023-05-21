const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const reqAuth = require("../middleware/reqAuth");

router.use(reqAuth);

//get watchlist end-point
router.get("/", (req, res) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) throw "User not found";
      const watchlist = user.watchlist;
      res.status(200).json({ watchlist });
    })
    .catch((error) => res.status(400).json({ error }));
});

//update watchlist end-point
router.put("/", (req, res) => {
  const userId = req.userId;
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
              res.status(200).json({ message: "New item added to watchlist" });
            }
            if (!result.matchedCount) throw "User does not exist";
          })
          .catch((err) => res.status(400).json({ error: err }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
});

//delete watchlist end-point
router.delete("/:watchlistId", (req, res) => {
  const { watchlistId } = req.params;
  const userId = req.userId;

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
            res.status(200).json({ message: "Item deleted from watchlist" });
          }
          if (!result.matchedCount) throw "User does not exist";
        })
        .catch((err) => res.status(400).json({ error: err }));
    })
    .catch((err) => res.status(400).json({ error: err }));
});

module.exports = router;
