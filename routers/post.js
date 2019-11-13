const express = require("express");
const router = express.Router();
const auth = require("../common/auth")();
const { Post, validatePost } = require("../models/post");
const { Tag } = require("../models/tag");
const wrapper = require("../common/wrapper");

// auth, 토큰을 분해해 유저정보를 나한테 전달
router.post(
  "/",
  auth.authenticate(),
  wrapper(async (req, res, next) => {
    if (!req.user.admin) {
      res.json({ error: "unauthorized" });
      next();
      return;
    }
    const { title, contents, tags } = req.body;
    if (validatePost(req.body).error) {
      res.status(400).json({ result: false, error: "양식에 맞지 않음" });
      next();
      return;
    }
    const post = new Post({
      title,
      author: req.user.id,
      contents,
      tags // nodejs backend express(id)
    });
    await post.save();
    // 여기까지가 포스트만 작성
    // 이제부터 tag에다가 업데이트
    for (const tag_id of tags) {
      const tag = await Tag.findById(tag_id);
      tag.posts.push(post._id);
      await tag.save();
    }
    res.json({ result: true });
    next();
  })
);
// 메인페이지의 글
router.get(
  "/",
  wrapper(async (req, res, next) => {
    const { tag, page = "1" } = req.query;
    const skip = parseInt(page) * 5 - 5;
    if (tag) {
      const posts = await Post.find()
        .where("tags")
        .in(tag)
        .skip(skip)
        .limit(5)
        .sort("-date")
        .populate("tags");
      res.json({ posts });
    } else {
      const posts = await Post.find()
        .limit(5)
        .skip(skip)
        .sort("-date")
        .populate("tags");
      res.json({ posts });
    }
    next();
  })
);
// 글 상세
router.get(
  "/:id",
  wrapper(async (req, res, next) => {
    const post = await Post.findById(req.params.id).populate("tags");
    res.json({ post });
    next();
  })
);

// 글 수정
router.patch(
  "/:id",
  auth.authenticate(),
  wrapper(async (req, res, next) => {
    if (!req.user.admin) {
      res.json({ error: "unauthorized" });
      next();
      return;
    }
    await Post.updateOne({ _id: req.params.id }, req.body);
    res.json({ result: true });
    next();
  })
);

// 글 삭제
router.delete(
  "/:id",
  auth.authenticate(),
  wrapper(async (req, res, next) => {
    if (!req.user.admin) {
      res.json({ error: "unauthorized" });
      next();
      return;
    }
    await Post.deleteOne({ _id: req.parmas.id });
    res.json({ result: true });
    next();
  })
);
module.exports = router;
