const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

mongoose
  .connect(
    `mongodb+srv://${process.env.username}:${process.env.password}@sandbox.vaxh3kz.mongodb.net/lang-learning-app?retryWrites=true&w=majority`
  )
  .then(() => console.log("Connected!"))
  .catch((e) => console.error("Failed to connect to DB...", e));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Language Leaning APP API server running....");
});

module.exports = router;
