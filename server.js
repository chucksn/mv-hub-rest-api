require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT;
const authRoute = require("./routes/auth-route");
const watchlistRoute = require("./routes/watchlist-routes");

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("connected to db");
    app.listen(port, () => console.log(`server listening at port ${port}`));
  })
  .catch((err) => console.log("error connecting to db", err));

app.use(express.json());
app.use(cors());

app.use("/api/v1/user/auth", authRoute);
app.use("/api/v1/watchlist", watchlistRoute);
