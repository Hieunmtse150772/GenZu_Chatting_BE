const router = require('express').Router();

const User = require('../controller/user.controller');
const verifyToken = require('../middleware/verifyToken.middleware');
const Validation = require('@/middleware/validation.middleware');
const { updateProfile } = require('@/validations/user.validation');

router.patch('/update/:id', verifyToken, Validation(updateProfile), User.updateProfile);
router.get('/sidebar', verifyToken, User.getUserForSidebar);
router.get('/searchUsers', verifyToken, User.getUserByKeyWord);
router.get('/searchUsers', verifyToken, User.getUserByKeyWord);

module.exports = router;
