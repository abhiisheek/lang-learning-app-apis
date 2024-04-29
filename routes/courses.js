const express = require("express");

const router = express.Router();

const Course = require("../models/course");

router.get("/", (req, res, next) => {
  try {
    const langId = req.query.langId;

    const filters = langId ? { langId } : {};

    Course.find(filters)
      .lean()
      .sort("level")
      .exec()
      .then((docs) => {
        res.send(docs);
      });
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
