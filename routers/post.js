const express = require("express");
const router = express.Router();
const auth = require("../common/auth")();
const { Post, validatePost } = require("../models/post");

// auth, 토큰을 분해해 유저정보를 나한테 전달
router.post("/", auth.authenticate(), async (req, res, next) => {
  const { title, contents, tags } = req.body;
  if (validatePost(req.body).error) {
    res.status(400).json({ result: false });
    next();
    return;
  }
  const post = new Post({
    title,
    author: req.user.id,
    contents,
    tags
  });
  await post.save();
  res.json({ result: true });
  next();
});

module.exports = router;
