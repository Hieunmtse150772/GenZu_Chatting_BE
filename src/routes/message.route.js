const router = require('express').Router();

const MessageController = require('../controller/message.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');
const { validateParams, validateBody } = require('@/middlewares/validator.middleware');
const messageMiddleware = require('@/middlewares/sort-filter-pagination/messageFeature.middleware');
const { validateIdMongodb, sendMessageBody } = require('@/validations');

router.get(
    '/getPaginationMessage/:id',
    verifyToken,
    validateParams(validateIdMongodb),
    messageMiddleware,
    MessageController.getAllMessagePagination,
);
router.get('/:id', verifyToken, validateParams(validateIdMongodb), MessageController.getAllMessages);
router.post('/send', verifyToken, validateBody(sendMessageBody), MessageController.sendSingleMessage);

module.exports = router;
