const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const secret = require("../secret");
const auth = require("../middleware/auth");

const router = express.Router();

const User = require("../models/user");
const Tracker = require("../models/tracker");
const Course = require("../models/course");

router.post("/signup", async (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  if (!email || !name || !password) {
    res.status(400).send("Bad Request - Payload not matching");
    return;
  }

  User.find({ email })
    .exec()
    .then(
      async (docs) => {
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
      },
      (err) => {
        console.error(err);
        res.status(500).send(err);
      }
    );
});

router.post("/login", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Bad Request - Payload not matching");
    return;
  }

  User.find({ email, password })
    .select("name email")
    .exec()
    .then(
      (docs) => {
        if (!docs?.length) {
          res.status(400).send("Login Failed!");
        } else {
          const token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
              data: docs[0],
            },
            secret.key
          );

          res.send(token);
        }
      },
      (err) => {
        console.error(err);
        res.status(500).send(err);
      }
    );
});

router.put("/preferences", auth, async (req, res, next) => {
  const preferences = req.body.preferences;
  const authorization = req.get("Authorization");

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  if (!preferences) {
    res.status(400).send("Bad Request - Preferences are missing in payload");
    return;
  }

  try {
    const data = jwt.verify(token, secret.key);

    const updated = await User.findOneAndUpdate(
      { email: data.data.email },
      {
        preferences: preferences,
      },
      {
        new: true,
      }
    );
    res.send(updated.preferences);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/preferences", auth, async (req, res, next) => {
  const authorization = req.get("Authorization");

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  try {
    const data = jwt.verify(token, secret.key);

    const userPreferences = await User.find({ email: data.data.email })
      .select("preferences")
      .exec();

    if (!userPreferences.length) {
      res.status(404).send("Failed to get user prefrences");
      return;
    }

    res.send(userPreferences[0].preferences);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/courses", auth, async (req, res, next) => {
  const authorization = req.get("Authorization");

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  try {
    const data = jwt.verify(token, secret.key);

    const enrolledCourses = await Tracker.find({
      userEmail: data.data.email,
    }).lean();

    const result = {};
    const courseIds = [];

    enrolledCourses.forEach((item) => {
      result[item.courseId] = item;
      courseIds.push(item.courseId);
    });

    const courses = await Course.find({ _id: { $in: courseIds } }).lean();

    courses.forEach((item) => {
      result[item._id] = { ...item, ...result[item._id] };
    });

    res.send(Object.values(result));
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/courses/:id", auth, async (req, res, next) => {
  const id = req.params["id"];

  if (!id) {
    res.status(404).send("Bad request");
    return;
  }

  const authorization = req.get("Authorization");

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  try {
    const data = jwt.verify(token, secret.key);

    const enrolledCourse = await Tracker.findOne({
      _id: id,
    }).lean();

    if (!enrolledCourse?._id) {
      res.status(404).send("Courses not found");
      return;
    }

    const course = await Course.findOne({
      _id: enrolledCourse.courseId,
    }).lean();

    if (!course?._id) {
      res.status(404).send("Courses not found");
      return;
    }

    res.send({ ...course, ...enrolledCourse });
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
