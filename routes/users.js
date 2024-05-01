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

router.put("/prefernces", auth, async (req, res, next) => {
  const prefernces = req.body.prefernces;
  const authorization = req.get("Authorization");

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  if (!prefernces) {
    res.status(400).send("Bad Request - Prefernces are missing in payload");
    return;
  }

  try {
    const data = jwt.verify(token, secret.key);

    const updated = await User.findOneAndUpdate(
      { email: data.data.email },
      {
        prefernces: prefernces,
      },
      {
        new: true,
      }
    );
    res.send(updated.prefernces);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/prefernces", auth, async (req, res, next) => {
  const authorization = req.get("Authorization");

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  try {
    const data = jwt.verify(token, secret.key);

    const userPrefernces = await User.find({ email: data.data.email })
      .select("prefernces")
      .exec();

    if (!userPrefernces.length) {
      res.status(404).send("Failed to get user prefrences");
      return;
    }

    res.send(userPrefernces[0].prefernces);
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

/* GET users listing. */
// router.get("/", (req, res, next) => {
//   User.find()
//     .exec()
//     .then((docs) => {
//       res.send(docs);
//     });
// });

module.exports = router;
