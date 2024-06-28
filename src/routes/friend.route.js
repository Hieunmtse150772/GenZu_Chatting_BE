const router = require('express').Router();

const FriendController = require('../controller/friend.controller');
const { verifyToken } = require('../utils/functions');

router.get('/', verifyToken, FriendController.getFriendList);
router.post('/', verifyToken, FriendController.sendAddFriendRequest);

module.exports = router;
