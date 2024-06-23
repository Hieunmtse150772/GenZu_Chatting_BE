const router = require('express').Router();

const MessageController = require('../controller/message.controller');
const verifyToken = require('../middleware/verifyToken.middleware');
const Validation = require('../middleware/validation.middleware');
const {
  getMessages,
  sendMessage,
} = require('../validations/message.validation');

router.get(
  '/:id',
  verifyToken,
  Validation(getMessages),
  MessageController.getMessages
);
router.post(
  '/send',
  verifyToken,
  Validation(sendMessage),
  MessageController.sendSingleMessage
);

module.exports = router;
