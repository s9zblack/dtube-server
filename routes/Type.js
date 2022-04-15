const express = require('express');
const { addType, getAllType } = require('../controller/TypeController');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin')

router.post('/', isAdmin,addType)

router.get('/',getAllType)

module.exports = router;