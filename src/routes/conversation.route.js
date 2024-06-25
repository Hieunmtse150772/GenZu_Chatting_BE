const router = require('express').Router();

const ConversationController = require('../controller/conversation.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');

router.get('/', verifyToken, ConversationController.fetchConversation);
router.post('/', verifyToken, ConversationController.accessConversation);

module.exports = router;
