const Video = require("../models/Video");
const User = require('../models/User')

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
    const videos = await Video.find({ userId: id }).skip(skip).limit(limit);
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
    const didLike = video.likes.some(item => item === userId);
    const didDislike = video.dislikes.some(item => item === userId);

    if(!didDislike  && !didLike) // chưa like chưa dislike
    {
      console.log('chưa like, chưa dislike');
      await Video.updateOne({_id:idVideo},{$push:{likes:userId}});
      //console.log(ab);
      console.log('ac');
      const rq = await Video.findOne({_id:idVideo})
      console.log('Find one');
      return res.json({success:true, video:rq});
    }

    if(!didDislike && didLike) // chưa dislikes, đã likes
    {
      console.log('chưa dislikes, đã like');
      const newLikes = video.likes.filter(item => item !== userId);
      const newUpdate = {
        _id: video._id,
        video: video.video,
        image: video.image,
        title: video.title,
        desc: video.desc,
        type: video.type,
        likes:newLikes.length > 0 ? newLikes : [],
        dislikes:video.dislikes
      }
      console.log('new Update');
      const rq = await Video.findOneAndUpdate({_id:idVideo},newUpdate,{new:true});
      console.log('gọi db');
      return res.json({success:true, video:rq});
    }

    if(didDislike && !didLike) // đã didsslikes, chưa likes
    {
      console.log('đã dislike, chưa like');
      //remove dislike,
      //adđ like
      const newDislikes = video.dislikes.filter(item => item !== userId);
      const newUpdate ={
        _id: video._id,
        video: video.video,
        image: video.image,
        title: video.title,
        desc: video.desc,
        type: video.type,
        likes:video.likes,
        dislikes:newDislikes.length > 0 ? newDislikes : []
      }
      const ab = await Video.findOneAndUpdate({_id:idVideo},newUpdate,{new:true});
      await Video.updateOne({_id:idVideo},{$push:{likes:userId}});
      const rq = await Video.findOne({_id:idVideo})
      return res.json({success:true, video:rq});
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
        dislikes:video.dislikes
      };
      const ab = await Video.findOneAndUpdate({ _id: idVideo }, newUpdate, {
        new: true,
      });
      await Video.updateOne({_id:idVideo},{$push:{dislikes:userId}})
      const rq = await Video.findOne({_id:idVideo})
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

const addView = async(req, res) => {
  const idVideo = req.params.id;
  try{
    const video = await Video.findOne({_id:idVideo});
    if(video)
    {
      video.view += 1;
      await video.save();
      return res.json({success:true, video:video})
    }
    return res.status(404).json({success:false, message:'Not found video'})
    
  }catch(err)
  {
    return res.json({success:false, message:'Internal server'})
  }
}


const getVideoPlayList = async(req,res) => {
  const userId = req.userId;
  try{
    const videosUser = await User.findOne({_id:userId});
    console.log(videosUser);
    const videos = await Video.find({_id:{$in:videosUser.videos}}).populate('userId');
    return res.json({success:true, video:videos})
  }catch(err)
  {
    return res.json({success:false, message:'Internal server'})
  }
}

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
  getVideoPlayList
};
