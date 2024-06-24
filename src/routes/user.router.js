const router = require('express').Router();

const User = require('../controller/user.controller');
const verifyToken = require('../middleware/verifyToken.middleware');

router.get('/sidebar', verifyToken, User.getUserForSidebar);
router.get('/searchUsers', verifyToken, User.getUserByKeyWord)

module.exports = router;
