const router = require('express').Router();

const AuthController = require('../controller/auth.controller');
const Validatation = require('../middlewares/validation.middleware');
const {
    signUp,
    signIn,
    changePassword,
    forgotPassword,
    verifyForgotPassword,
} = require('../validations/auth.validation');
const verifyToken = require('@/middleware/verifyToken.middleware');

router.post('/sign-in', Validatation(signIn), AuthController.signIn);
router.post('/sign-up', Validatation(signUp), AuthController.signUp);
router.get('/sign-in-google', AuthController.signInWithGoogle);
router.get('/callback', AuthController.callBack);
router.post('/refresh-token', AuthController.refreshToken);
router.delete('/logout', AuthController.logout);
router.post('/resend-verify-email', AuthController.resendVerifyEmail);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/change-password', Validatation(changePassword), verifyToken, AuthController.changePassword);
router.post('/forgot-password', Validatation(forgotPassword), AuthController.forgotPassword);
router.post('/verify-forgot-password', Validatation(verifyForgotPassword), AuthController.verifyForgotPassword);

module.exports = router;
