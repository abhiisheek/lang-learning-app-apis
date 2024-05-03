const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const secret = require("../secret");

const router = express.Router();

const Tracker = require("../models/tracker");
const { STATUES } = require("../constants");

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

router.put("/status", async (req, res, next) => {
  const _id = req.body.id;
  const status = req.body.status;
  const timestamp = req.body.timestamp;

  if (
    !_id ||
    (status !== STATUES.IN_PROGRESS && status !== STATUES.COMPLETED)
  ) {
    res.status(400).send("Bad Request - invalid payload");
    return;
  }

  try {
    const doc = await Tracker.findOne({ _id });

    if (doc?.status !== STATUES.NOT_STARTED && status === STATUES.IN_PROGRESS) {
      res.status(400).send("Course is not in right status to start it.");
      return;
    }

    if (doc?.status !== STATUES.IN_PROGRESS && status === STATUES.COMPLETED) {
      res
        .status(400)
        .send("Course is not in right status to mark it as complete.");
      return;
    }

    const updated = await Tracker.findOneAndUpdate(
      { _id },
      {
        [status === STATUES.IN_PROGRESS ? "startedTs" : "completedTs"]:
          timestamp,
        status: status,
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

module.exports = router;
