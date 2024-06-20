const router = require('express').Router();

const AuthController = require('../controller/auth.controller');
const Validatation = require('../middleware/validation.middleware');
const { signUp, signIn } = require('../validations/auth.validation');

router.post('/sign-in', Validatation(signIn), AuthController.signIn);
router.post('/sign-up', Validatation(signUp), AuthController.signUp);
router.get('/sign-in-google', AuthController.signInWithGoogle);
router.get('/callback', AuthController.callBack);
router.post('/refresh-token', AuthController.refreshToken);
router.delete('/logout', AuthController.logout);

module.exports = router;
