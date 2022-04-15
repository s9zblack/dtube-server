const Comment = require("../models/Comment");

const addComments = async (req, res) => {
  const videoId = req.params.id;
  const userId = req.userId;
  const { text } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: "Missing field" });
  }
  try {
    const newComment = new Comment({
      videoId,
      userId,
      text,
    });
    await newComment.save();
    const comment = await Comment.find({ _id: newComment._id }).populate(
      "userId"
    );
    return res.json({ success: true, comment });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getCommentByVideoId = async (req, res) => {
  const id = req.params.id;
  try {
    const comments = await Comment.find({ videoId: id })
      .sort("-createdAt")
      .populate("userId");
    return res.json({ success: true, comments });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const deleteComments = async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  try {
    const isFound = await Comment.find({ _id: id });
    if ((isFound.userId = userId)) {
      await Comment.findOneAndDelete({ _id: id });
      return res.json({ success: true, message: "Delete successfull" });
    }
    return res.status(400).json({ success: false, message: "Error token" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

module.exports = {
  addComments,
  getCommentByVideoId,
  deleteComments,
};
