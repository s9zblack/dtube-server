const express = require("express");
const router = express.Router();
const isLogin = require("../middleware/isLogin");

const {
  registerUser,
  loginUser,
  getInfoUser,
  followByUserId,
  getFollowById,
  unFollowById,
  addSaveVideo,
} = require("../controller/UserController");
// /api/auth
router.get("/", (req, res) => res.send("Datisekai get auth successfull"));

// /api/auth/register
router.post("/register", registerUser);
// body require (email, password), not require (address, phoneNumber, name)
//return userId and token

// /api/auth/login
router.post("/login", loginUser);
// body require (email,password)
//return userId and token

// /api/auth/user
router.get("/user", isLogin, getInfoUser);
// header token

router.put('/follow/:id',isLogin,followByUserId)
router.put('/unfollow/:id',isLogin,unFollowById)

router.get('/follow/:id',getFollowById)

router.get('/save/:id',isLogin,addSaveVideo)
module.exports = router;
