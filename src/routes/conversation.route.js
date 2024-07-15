const router = require('express').Router();

const ConversationController = require('../controller/conversation.controller');
const GroupChatController = require('@/controller/group_chat.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');
const { validateBody, validateParams, validateQuery } = require('@/middlewares/validator.middleware');
const {
    createGroupBody,
    updateGroupBody,
    validateIdMongodb,
    addMemberGroupBody,
    deleteMemberGroupBody,
    updateBackgroundConversation,
    updateAvatarConversation,
} = require('@/validations');

router.get('/:id', verifyToken, validateParams(validateIdMongodb), ConversationController.getConversationById);
router.get('/', verifyToken, ConversationController.fetchConversation);
router.post('/', verifyToken, ConversationController.accessConversation);
router.patch('/', verifyToken, validateQuery(validateIdMongodb), ConversationController.redoHistoryConversation);
router.delete('/', verifyToken, validateQuery(validateIdMongodb), ConversationController.removeHistoryConversation);
router.patch(
    '/background',
    verifyToken,
    validateQuery(validateIdMongodb),
    validateBody(updateBackgroundConversation),
    ConversationController.updateConversationBackground,
);
router.patch(
    '/avatar',
    verifyToken,
    validateQuery(validateIdMongodb),
    validateBody(updateAvatarConversation),
    ConversationController.updateConversationAvatar,
);

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
    validateBody(deleteMemberGroupBody),
    GroupChatController.deleteMemberGroupChat,
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
