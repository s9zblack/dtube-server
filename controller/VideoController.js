const Video = require("../models/Video");
const User = require("../models/User");

const addVideo = async (req, res) => {
  const userId = req.userId;
  const { image, video, title, desc, type } = req.body;

  if (!video || !userId || !title || !desc || !type) {
    return res.status(400).json({ success: false, message: "Missing field" });
  }

  try {
    const newVideo = new Video({
      userId,
      image,
      video,
      desc,
      title,
      type,
    });
    await newVideo.save();
    return res.json({ success: true, newVideo });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getMyVideo = async (req, res) => {
  const userId = req.userId;
  const limit = 8;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  try {
    const myVideo = await Video.find({ userId }).skip(skip).limit(limit);
    return res.json({ success: true, videos: myVideo });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getAllVideo = async (req, res) => {
  const limit = 8;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  try {
    const videos = await Video.find()
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("userId");
    return res.json({ success: true, videos });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getVideoById = async (req, res) => {
  const limit = 8;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  const id = req.params.id;
  if (!id) {
    return res.status(404).json({ success: false, message: "Missing id" });
  }
  try {
    const videos = await Video.find({ userId: id })
      .skip(skip)
      .limit(limit)
      .populate("userId")
      .sort("-createdAt");
    return res.json({ success: true, videos });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getVideoByType = async (req, res) => {
  const id = req.params.id;
  const limit = 8;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  try {
    if (!id) {
      const videos = await Video.find()
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .populate("userId");
      return res.json({ success: true, videos });
    }
    const videos = await Video.find({ type: id })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("userId");
    return res.json({ success: true, videos });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getDetail = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.json({ success: false, message: "Missing id" });
  }
  try {
    const video = await Video.findById({ _id: id }).populate("userId");
    return res.json({ success: true, video });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const addLikeVideo = async (req, res) => {
  const userId = req.userId;
  const idVideo = req.params.id;
  try {
    const video = await Video.findOne({ _id: idVideo });
    const didLike = video.likes.some((item) => item === userId);
    const didDislike = video.dislikes.some((item) => item === userId);

    if (!didDislike && !didLike) {
      // chưa like chưa dislike
      await Video.updateOne({ _id: idVideo }, { $push: { likes: userId } });
      //console.log(ab);
      const rq = await Video.findOne({ _id: idVideo });
      return res.json({ success: true, video: rq });
    }

    if (!didDislike && didLike) {
      // chưa dislikes, đã likes
      const newLikes = video.likes.filter((item) => item !== userId);
      const newUpdate = {
        _id: video._id,
        video: video.video,
        image: video.image,
        title: video.title,
        desc: video.desc,
        type: video.type,
        likes: newLikes.length > 0 ? newLikes : [],
        dislikes: video.dislikes,
      };
      const rq = await Video.findOneAndUpdate({ _id: idVideo }, newUpdate, {
        new: true,
      });
      return res.json({ success: true, video: rq });
    }

    if (didDislike && !didLike) {
      // đã didsslikes, chưa likes
      //remove dislike,
      //adđ like
      const newDislikes = video.dislikes.filter((item) => item !== userId);
      const newUpdate = {
        _id: video._id,
        video: video.video,
        image: video.image,
        title: video.title,
        desc: video.desc,
        type: video.type,
        likes: video.likes,
        dislikes: newDislikes.length > 0 ? newDislikes : [],
      };
      const ab = await Video.findOneAndUpdate({ _id: idVideo }, newUpdate, {
        new: true,
      });
      await Video.updateOne({ _id: idVideo }, { $push: { likes: userId } });
      const rq = await Video.findOne({ _id: idVideo });
      return res.json({ success: true, video: rq });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const disLikeVideo = async (req, res) => {
  const userId = req.userId;
  const idVideo = req.params.id;
  try {
    const video = await Video.findOne({ _id: idVideo });
    const didDislike = video.dislikes.some(
      (item) => item === userId.toString()
    );
    const didLike = video.likes.some((item) => item === userId.toString());

    if (!didDislike && !didLike) {
      // chua like, chua dislike
      const newDislikes = video.dislikes.push(userId);
      const newUpdate = {
        ...video,
        dislikes: newDislikes,
      };

      const rq = await Video.findOneAndUpdate({ _id: idVideo }, newUpdate, {
        new: true,
      });
      return res.json({ success: true, video: rq });
    }

    if (!didDislike && didLike) {
      // chua dislike, da like
      const newLikes = video.likes.filter((item) => item !== userId);
      const newUpdate = {
        _id: video._id,
        video: video.video,
        image: video.image,
        title: video.title,
        desc: video.desc,
        type: video.type,
        likes: newLikes.length > 0 ? newLikes : [],
        dislikes: video.dislikes,
      };
      const ab = await Video.findOneAndUpdate({ _id: idVideo }, newUpdate, {
        new: true,
      });
      await Video.updateOne({ _id: idVideo }, { $push: { dislikes: userId } });
      const rq = await Video.findOne({ _id: idVideo });
      return res.json({ success: true, video: rq });
    }

    if (didDislike && !didLike) {
      // da dislike, chua like
      const newDislikes = video.dislikes.filter((item) => item !== userId);
      const newUpdate = {
        _id: video._id,
        video: video.video,
        image: video.image,
        title: video.title,
        desc: video.desc,
        type: video.type,
        likes: video.likes,
        dislikes: newDislikes.length > 0 ? newDislikes : [],
      };
      const rq = await Video.findOneAndUpdate({ _id: idVideo }, newUpdate, {
        new: true,
      });
      return res.json({ success: true, video: rq });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const addView = async (req, res) => {
  const idVideo = req.params.id;
  try {
    const video = await Video.findOne({ _id: idVideo });
    if (video) {
      video.view += 1;
      await video.save();
      return res.json({ success: true, video: video });
    }
    return res.status(404).json({ success: false, message: "Not found video" });
  } catch (err) {
    return res.json({ success: false, message: "Internal server" });
  }
};

const getVideoPlayList = async (req, res) => {
  const userId = req.userId;
  const limit = 8;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  try {
    const videosUser = await User.findOne({ _id: userId });
    const videos = await Video.find({
      _id: { $in: videosUser.videos },
    })
      .populate("userId")
      .limit(limit)
      .skip(skip);
    return res.json({ success: true, videos: videos });
  } catch (err) {
    return res.json({ success: false, message: "Internal server" });
  }
};

const getVideoLikeByToken = async (req, res) => {
  const userId = req.userId;
  const limit = 8;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;

  try {
    const videos = await Video.find().populate("userId");
    const videoReturn = videos.filter((item) => item.likes.includes(userId));

    return res.json({ success: true, videos: videoReturn });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getVideoSubscription = async (req, res) => {
  const userId = req.userId;
  const limit = 8;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  try {
    const users = await User.find();
    const userFollow = users.filter((item) => item.follows.includes(userId));
    const videoReturn = await Video.find({
      userId: { $in: userFollow },
    })
      .populate("userId")
      .limit(limit)
      .skip(skip);

    return res.json({ success: true, videos: videoReturn });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getVideoPopular = async (req, res) => {
  const limit = 8;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  try {
    const videoReturn = await Video.find()
      .sort("-view")
      .populate("userId")
      .limit(limit)
      .skip(skip);
    return res.json({ success: true, videos: videoReturn });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getVideoShort = async (req, res) => {
  const limit = 2;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  try {
    const videoReturn = await Video.find()
      .sort("-view")
      .populate("userId")
      .limit(limit)
      .skip(skip);
    return res.json({ success: true, videos: videoReturn });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getVideoQuery = async (req, res) => {
  const limit = 8;
  const page = req.query.page || 1;
  const text = req.query.query;
  const skip = (page - 1) * limit;
  try {
    const searchPattern = new RegExp(text, "i");
    const videoReturn = await Video.find({ title: searchPattern })
      .skip(skip)
      .limit(limit);
    return res.json({ success: true, videos: videoReturn });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

module.exports = {
  addVideo,
  getMyVideo,
  getAllVideo,
  getVideoById,
  getVideoByType,
  getDetail,
  disLikeVideo,
  addLikeVideo,
  addView,
  getVideoPlayList,
  getVideoLikeByToken,
  getVideoSubscription,
  getVideoPopular,
  getVideoShort,
  getVideoQuery,
};
