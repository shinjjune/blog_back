const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const { User, validateUser } = require("../models/user");
const { jwtSecret } = require("../common/jwt_config");

// 회원가입
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

// 로그인
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    res.json({ result: false });
    next();
    return;
  }
  const result = await bcrypt.compare(password, user.password);
  if (result) {
    // 토큰을 만들어 줍시다!
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        admin: user.admin
      },
      jwtSecret,
      { expiresIn: "1h" }
    );
    res.json({ result: true, token, admin: user.admin });
    next();
  } else {
    res.json({ result: false });
    next();
  }
});

module.exports = router;
