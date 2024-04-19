const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Course = require("../models/course");

router.get("/", (req, res, next) => {
  try {
    Course.find()
      .lean()
      .sort("langId")
      .exec()
      .then((docs) => res.send(docs));
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
