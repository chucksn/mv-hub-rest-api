require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT;
const host = process.env.HOST;
const userSignInRoute = require("./routes/user-signIn-route");

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("connected to db");
    app.listen(port, host, () =>
      console.log(`server listening at port ${port}`)
    );
  })
  .catch((err) => console.log("error connecting to db", err));

app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userSignInRoute);
