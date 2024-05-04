const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const secret = require("../secret");

const router = express.Router();

const Tracker = require("../models/tracker");
const User = require("../models/user");
const { STATUES } = require("../constants");

router.post("/enroll", async (req, res, next) => {
  const courseId = req.body.courseId;
  const enrolledTs = req.body.enrolledTs;
  const langId = req.body.langId;
  const level = req.body.level;
  const authorization = req.get("Authorization");

  if (!courseId) {
    res.status(400).send("Bad Request - courseId is missing in payload");
    return;
  }

  try {
    const token = authorization.startsWith("Bearer ") && authorization.slice(7);
    const data = jwt.verify(token, secret.key);

    Tracker.find({ courseId, userEmail: data.data.email })
      .exec()
      .then(async (docs) => {
        if (docs?.length) {
          res.status(400).send("User already enrolled to the course");
        } else {
          const user = await User.findOne({
            email: data.data.email,
          }).lean();

          if (!user.assessments[langId]) {
            res
              .status(404)
              .send(
                "Course language is not enrolled by to user to enroll the course"
              );
            return;
          }

          const _id = new mongoose.Types.ObjectId();
          const newTracker = new Tracker({
            _id,
            courseId,
            userEmail: data.data.email,
            status: "NOT_STARTED",
            enrolledTs,
            langId,
            level,
          });

          await newTracker.save();

          user.assessments[langId].enrolledCourses[_id] = { enrolledTs };

          await User.findOneAndUpdate(
            { email: data.data.email },
            {
              assessments: user.assessments,
            },
            {
              new: true,
            }
          );

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
  const authorization = req.get("Authorization");

  if (
    !_id ||
    (status !== STATUES.IN_PROGRESS && status !== STATUES.COMPLETED)
  ) {
    res.status(400).send("Bad Request - invalid payload");
    return;
  }

  try {
    const token = authorization.startsWith("Bearer ") && authorization.slice(7);
    const data = jwt.verify(token, secret.key);

    const doc = await Tracker.findOne({ _id }).lean();
    const user = await User.findOneAndUpdate({
      email: data.data.email,
    }).lean();

    if (!doc || !user) {
      res.status(404).send("Course not found");
      return;
    }

    const langId = doc.langId;

    if (doc.level > user.assessments[langId].proficiency + 1) {
      res
        .status(404)
        .send(
          "Failed. You need to complete the courses of previous level before this"
        );
      return;
    }

    if (!user.assessments[langId]) {
      res
        .status(404)
        .send(
          "Course language is not enrolled by to user to update the course"
        );
      return;
    }

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

    let tsFieldKey;

    if (status === STATUES.IN_PROGRESS) {
      tsFieldKey = "startedTs";
      user.assessments[langId].startedCourses[_id] = {
        [tsFieldKey]: timestamp,
      };
    } else {
      tsFieldKey = "completedTs";
      const details = user.assessments[langId];

      details.completedCourses[_id] = {
        [tsFieldKey]: timestamp,
      };

      if (details.proficiency < doc.level) {
        details.proficiency = doc.level;
      }
    }

    const updated = await Tracker.findOneAndUpdate(
      { _id },
      {
        [tsFieldKey]: timestamp,
        status: status,
      },
      {
        new: true,
      }
    );

    await User.findOneAndUpdate(
      { email: data.data.email },
      {
        assessments: user.assessments,
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
