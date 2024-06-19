const router = require('express').Router();

const User = require('../controller/user.controller');
const verifyToken = require('../middleware/verifyToken.middleware');

router.get('/sidebar', verifyToken, User.getUserForSidebar);

module.exports = router;
