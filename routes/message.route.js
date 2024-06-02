const router = require('express').Router();

const MessageController = require('../controller/message.controller');
const verifyToken = require('../middleware/verifyToken.middleware');

router.post('/:id', verifyToken, MessageController.getMessages);
router.post('/send/:id', verifyToken, MessageController.sendMessage);

module.exports = router;
