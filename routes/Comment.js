const express = require("express");
const {
  getCommentByVideoId,
  addComments,
  deleteComments,
} = require("../controller/CommentController");
const router = express.Router();
const isLogin = require("../middleware/isLogin");

router.get("/:id", getCommentByVideoId);

router.post("/:id", isLogin, addComments);

router.delete('/:id',isLogin,deleteComments)

module.exports = router;
