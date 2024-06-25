const router = require('express').Router();

const MessageController = require('../controller/message.controller');
const verifyToken = require('../middleware/verifyToken.middleware');
const Validation = require('../middleware/validation.middleware');
const { getMessages, sendMessage } = require('../validations/message.validation');

router.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
router.get('/:id', verifyToken, Validation(getMessages), MessageController.getMessages);
router.post('/send/:id', verifyToken, Validation(sendMessage), MessageController.sendMessage);

module.exports = router;
