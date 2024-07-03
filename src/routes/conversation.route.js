const router = require('express').Router();

const ConversationController = require('../controller/conversation.controller');
const GroupChatController = require('@/controller/group_chat.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');
const { validateBody, validateParams } = require('@/middlewares/validator.middleware');
const { createGroupBody, updateGroupBody, validateIdMongodb, addMemberGroupBody } = require('@/validations');

router.get('/', verifyToken, ConversationController.fetchConversation);
router.post('/', verifyToken, ConversationController.accessConversation);
router.post('/group', verifyToken, validateBody(createGroupBody), GroupChatController.createGroupChat);
router.patch(
    '/add-member/group/:id',
    verifyToken,
    validateParams(validateIdMongodb),
    validateBody(addMemberGroupBody),
    GroupChatController.addMemberGroupChat,
);
router.patch(
    '/delete-member/group/:id',
    verifyToken,
    validateParams(validateIdMongodb),
    validateBody(validateIdMongodb),
    GroupChatController.deleteGroupChat,
);
router.patch(
    '/group/:id',
    verifyToken,
    validateParams(validateIdMongodb),
    validateBody(updateGroupBody),
    GroupChatController.updateGroupChat,
);
router.delete('/group/:id', verifyToken, validateParams(validateIdMongodb), GroupChatController.deleteGroupChat);

module.exports = router;
