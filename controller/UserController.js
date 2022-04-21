const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const Users = require("../models/User");
const { findOne, updateOne, findOneAndUpdate } = require("../models/User");
const User = require("../models/User");

const registerUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing username or password" });
  }
  try {
    const isEmail = await Users.findOne({ email });
    if (isEmail) {
      return res
        .status(500)
        .json({ success: false, message: "Username already" });
    }

    //good
    const hashPassword = await argon2.hash(password);
    const newUser = new Users({
      email,
      password: hashPassword,
      follows: [],
    });
    await newUser.save();

    const token = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role,
      },
      process.env.JWT
    );
    return res.json({
      success: true,
      message: "Register successfull",
      token,
      userId: newUser._id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing email or password" });
  }

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email or password" });
    }

    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email or password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT
    );
    return res.json({ success: true, token });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getInfoUser = async (req, res) => {
  const userID = req.userId;
  if (!userID)
    return res.send(400).json({
      success: false,
      message: "Incorrect token",
    });
  const user = await Users.findOne({ _id: userID }).select("-password");

  if (!user) {
    return res.send(400).json({
      success: false,
      message: "Incorrect userId",
    });
  }
  return res.status(200).json({
    success: true,
    user,
  });
};

const followByUserId = async (req, res) => {
  const id = req.userId; // id người ấn follow
  const userId = req.params.id; // id người được follow

  try {
    const curUser = await Users.findOne({ _id: userId }).select("-password");
    if (curUser) {
      const isFound = curUser.follows.some((item) => {
        return item === id;
      });
      if (!isFound) {
        const follows = curUser.follows.push(id);
        const updateFollow = await Users.findOneAndUpdate(
          { _id: userId },
          { ...curUser, follows },
          { new: true }
        );
        return res.json({ success: true, user: updateFollow });
      }
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const unFollowById = async (req, res) => {
  const id = req.userId; // id người ấn follow
  const userId = req.params.id; // id người được follow

  try {
    const curUser = await Users.findOne({ _id: userId }).select("-password");
    if (curUser) {
      const isFound = curUser.follows.some((item) => {
        console.log(item);
        return item === id;
      });
      if (isFound) {
        const follows = curUser.follows.filter((item) => item !== id);
        console.log(curUser.follows);
        console.log(follows);
        const updateFollow = await Users.findOneAndUpdate(
          { _id: userId },
          { follows: follows.length > 0 ? follows : [] },
          { new: true }
        );
        return res.json({ success: true, user: updateFollow });
      }
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getFollowById = async (req, res) => {
  const id = req.userId;
  const userId = req.params.id;
  try {
    const user = await Users.findOne({ _id: userId }).select("-password");
    if (user) {
      return res.json({ success: true, user, id: id });
    }
    return res.status(400).json({ success: false, message: "Missing" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const addSaveVideo = async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  try {
    const curUser = await Users.findOne({ _id: userId });
    if (curUser) {
      const isFound = curUser.videos.some((item) => item === id);
      if (isFound) {
        const newVideos = curUser.videos.filter((item) => item !== id);
        curUser.videos = newVideos.length > 0 ? newVideos : [];
        await curUser.save();
      } else {
        await Users.updateOne({ _id: userId }, { $push: { videos: id } });
      }
      return res.json({ success: true, user: curUser });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const updateUser = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(404).json({ success: false, message: "Incorret token" });
  }
  const { name, avatar } = req.body;
  try {
    if (!avatar) {
      const user = await Users.findOneAndUpdate({ _id: userId }, { name });
      return res.json({ success: true, user: user, name });
    }
    const user = await Users.findOneAndUpdate(
      { _id: userId },
      { name, avatar }
    );
    return res.json({ success: true, user: user, name, avatar });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

const getInfoById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await Users.findOne({ _id: id }).select("-password");
    return res.json({success:true, user})
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getInfoUser,
  followByUserId,
  getFollowById,
  unFollowById,
  addSaveVideo,
  updateUser,getInfoById
};
