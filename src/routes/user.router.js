const router = require('express').Router();

const User = require('../controller/user.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');
const { validateBody } = require('@/middlewares/validator.middleware');
const { updateProfileBody } = require('@/validations');

router.patch('/update/:id', verifyToken, validateBody(updateProfileBody), User.updateProfile);
router.get('/sidebar', verifyToken, User.getUserForSidebar);
router.get('/searchUsers', verifyToken, User.getUserByKeyWord);

module.exports = router;
