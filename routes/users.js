var express = require("express");
var router = express.Router();

const User = require("../models/user");

router.post("/login", function (req, res, next) {
  const email = req.body.email;
  const password = req.params.password;

  User.find({ email })
    .exec()
    .then((docs) => res.send(docs));
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  User.find()
    .select("name email")
    .exec()
    .then((docs) => res.send(docs));
});

module.exports = router;
