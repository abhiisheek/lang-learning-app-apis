const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const User = require("../models/user");

router.post("/signup", async (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  if (!email || !name || !password) {
    res.status(400).send("Bad Request - Payload not matching");
  }

  User.find({ email })
    .exec()
    .then(async (docs) => {
      if (docs?.length) {
        res.status(400).send("User already exists");
      } else {
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          name,
          email,
          password,
        });

        await newUser.save();

        res.send(newUser);
      }
    });
});

router.post("/login", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Bad Request - Payload not matching");
  }

  User.find({ email, password })
    .select("name email")
    .exec()
    .then((docs) => {
      if (!docs?.length) {
        res.status(400).send("Login Failed!");
      } else {
        res.send(docs);
      }
    });
});

/* GET users listing. */
router.get("/", (req, res, next) => {
  User.find()
    .select("name email")
    .exec()
    .then((docs) => res.send(docs));
});

module.exports = router;
