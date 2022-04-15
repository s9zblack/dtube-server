const express = require("express");
const { getMyVideo, addVideo, getVideoById, getAllVideo, getVideoByType, getDetail, addLikeVideo, disLikeVideo, addView, getVideoPlayList } = require("../controller/VideoController");
const router = express.Router();
const isLogin = require("../middleware/isLogin");

router.get("/", isLogin, getMyVideo);

router.get('/:id',getVideoById);

router.get('/videos/type', getAllVideo)

router.get('/videos/type/:id', getVideoByType)

router.get('/watch/:id', getDetail)

router.post("/", isLogin, addVideo);

router.post('/like/:id',isLogin,addLikeVideo)
router.post('/dislike/:id',isLogin,disLikeVideo)

router.get('/view/:id',addView)

router.get('/videos/playlist',isLogin,getVideoPlayList)

module.exports = router;
