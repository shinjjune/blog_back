const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const { User, validateUser } = require("../models/user");

router.post("/join", async (req, res, next) => {
  const { name, email, password } = req.body;
  if (validateUser(req.body).error) {
    // 검증과정 통과 못하면
    res.status(400).json({ result: false });
    next();
    return;
  }
  const saltRound = 10;
  const hashedPW = await bcrypt.hash(password, saltRound);
  const user = new User({ name, email, password: hashedPW });
  const saveResult = await user.save(); // db에 저장
  res.json({ result: true });
  next();
});
module.exports = router;
