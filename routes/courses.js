const express = require("express");

const router = express.Router();

const Course = require("../models/course");

router.post("/", (req, res, next) => {
  try {
    const langIds = req.body.langIds;

    const filters = Array.isArray(langIds) ? { langId: { $in: langIds } } : {};

    Course.find(filters)
      .lean()
      .sort("langId")
      .exec()
      .then((docs) => {
        res.send(docs);
      });
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
