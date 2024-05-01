const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const secret = require("../secret");

const router = express.Router();

const Tracker = require("../models/tracker");

router.post("/enroll", async (req, res, next) => {
  const courseId = req.body.courseId;
  const enrolledTs = req.body.enrolledTs;
  const authorization = req.get("Authorization");

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  if (!courseId) {
    res.status(400).send("Bad Request - courseId is missing in payload");
    return;
  }

  try {
    Tracker.find({ courseId })
      .exec()
      .then(async (docs) => {
        if (docs?.length) {
          res.status(400).send("User already enrolled to the course");
        } else {
          const data = jwt.verify(token, secret.key);

          const newTracker = new Tracker({
            _id: new mongoose.Types.ObjectId(),
            courseId,
            userEmail: data.data.email,
            status: 1,
            enrolledTs,
          });

          await newTracker.save();

          res.send(newTracker);
        }
      });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/start", async (req, res, next) => {
  const _id = req.body.id;
  const startedTs = req.body.startedTs;

  if (!_id) {
    res.status(400).send("Bad Request - id is missing in payload");
    return;
  }

  try {
    const updated = await Tracker.findOneAndUpdate(
      { _id },
      {
        startedTs,
        status: 2,
      },
      {
        new: true,
      }
    );

    res.send(updated);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/complete", async (req, res, next) => {
  const _id = req.body.id;
  const completedTs = req.body.completedTs;

  if (!_id) {
    res.status(400).send("Bad Request - id is missing in payload");
    return;
  }

  try {
    const doc = await Tracker.findOne({ _id });

    if (doc?.status !== 2) {
      res
        .status(400)
        .send(
          "Bad Request - Course is not in started status to mark it as complete"
        );
      return;
    }

    const updated = await Tracker.findOneAndUpdate(
      { _id },
      {
        completedTs,
        status: 3,
      },
      {
        new: true,
      }
    );

    res.send(updated);
  } catch (err) {
    res.status(500).send(err);
  }
});

/* GET users listing. */
// router.get("/", (req, res, next) => {
//   User.find()
//     .exec()
//     .then((docs) => {
//       res.send(docs);
//     });
// });

module.exports = router;
