const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Language = require("../models/language");

router.get("/", (req, res, next) => {
  try {
    Language.find()
      .lean()
      .sort("_id")
      .exec()
      .then((docs) => res.send(docs));
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
