const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });

    user
      .save()
      .then((result) => {
        res.status(201).json({ message: "User created", result: result });
      })
      .catch((e) => {
        res.status(500).json({ error: e });
      });
  });
});

router.post("/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "secret",
        { expiresIn: "1h" }
      );

      res.status(200).json({ token, expiresIn: 3600, userId: fetchedUser._id });
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({
        message: "Auth Failed",
      });
    });
});

module.exports = router;
