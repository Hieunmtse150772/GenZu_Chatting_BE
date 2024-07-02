const router = require('express').Router();

const FriendController = require('../controller/friend.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');

router.get('/', verifyToken, FriendController.getFriendList);

router.put('/', verifyToken, FriendController.updateFriendRequest);

router.post('/addFriendRequest', verifyToken, FriendController.createAddFriendRequest);

router.get('/addFriendRequest', verifyToken, FriendController.getAddFriendRequest);

router.put('/acceptFriendRequest', verifyToken, FriendController.acceptFriendRequest);

router.patch('/rejectFriendRequest', verifyToken, FriendController.rejectFriendRequest);

router.get('/friendRequestHasBeenSent', verifyToken, FriendController.getAddFriendRequestHasBeenSent);

router.delete('/friendRequestHasBeenSent', verifyToken, FriendController.removeFriendRequest);

router.delete('/deleteFriend', verifyToken, FriendController.removeFriend);

module.exports = router;
