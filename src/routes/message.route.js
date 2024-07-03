const router = require('express').Router();

const MessageController = require('../controller/message.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');
const { validateParams, validateBody, validateQuery } = require('@/middlewares/validator.middleware');
const messageMiddleware = require('@/middlewares/sort-filter-pagination/messageFeature.middleware');
const { validateIdMongodb, sendMessage, sendEmoji, getMessages, updateEmoji } = require('@/validations');

router.get(
    '/getMessagePagination',
    verifyToken,
    validateQuery(getMessages),
    messageMiddleware,
    MessageController.getAllMessagePagination,
);
router.get('/:id', verifyToken, validateParams(validateIdMongodb), MessageController.getAllMessages);

router.post(
    '/send',
    verifyToken,
    validateQuery(validateIdMongodb),
    validateBody(sendMessage),
    MessageController.sendSingleMessage,
);

router.patch('/deleteMessageByOneSide', validateQuery(validateIdMongodb), verifyToken, MessageController.deleteMessage);

router.delete('/recall', verifyToken, validateParams(validateIdMongodb), MessageController.recallMessage);

router.post('/emoji', verifyToken, validateBody(sendEmoji), MessageController.addEmojiMessage);

router.patch('/emoji', validateBody(updateEmoji), verifyToken, MessageController.updateEmojiMessage);

router.delete('/emoji', verifyToken, MessageController.removeEmojiMessage);

module.exports = router;
