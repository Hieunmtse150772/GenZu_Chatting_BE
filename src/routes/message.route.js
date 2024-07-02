const router = require('express').Router();

const MessageController = require('../controller/message.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');
const Validation = require('../middlewares/validation.middleware');
const { getMessages, sendMessage } = require('../validations/message.validation');
const messageMiddleware = require('@/middlewares/sort-filter-pagination/messageFeature.middleware');

router.get(
    '/getMessagePagination',
    verifyToken,
    Validation(getMessages),
    messageMiddleware,
    MessageController.getAllMessagePagination,
);

router.get('/:id', verifyToken, Validation(getMessages), MessageController.getAllMessages);

router.post('/send', verifyToken, Validation(sendMessage), MessageController.sendSingleMessage);

router.patch('/deleteMessageByOneSide', verifyToken, MessageController.deleteMessage);

router.delete('/recall', verifyToken, MessageController.recallMessage);

router.post('/emoji', verifyToken, MessageController.addEmojiMessage);

router.patch('/emoji', verifyToken, MessageController.updateEmojiMessage);

router.delete('/emoji', verifyToken, MessageController.removeEmojiMessage);

module.exports = router;
