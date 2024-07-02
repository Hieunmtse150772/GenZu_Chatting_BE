const router = require('express').Router();

const AuthController = require('../controller/auth.controller');
const { validateBody } = require('@/middlewares/validator.middleware');
const {
    signUpBody,
    signInBody,
    changePasswordBody,
    forgotPasswordBody,
    verifyForgotPasswordBody,
} = require('@/validations');
const verifyToken = require('@/middlewares/verifyToken.middleware');

router.post('/sign-in', validateBody(signInBody), AuthController.signIn);
router.post('/sign-up', validateBody(signUpBody), AuthController.signUp);
router.get('/sign-in-google', AuthController.signInWithGoogle);
router.get('/callback', AuthController.callBack);
router.post('/refresh-token', AuthController.refreshToken);
router.delete('/logout', AuthController.logout);
router.post('/resend-verify-email', AuthController.resendVerifyEmail);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/change-password', validateBody(changePasswordBody), verifyToken, AuthController.changePassword);
router.post('/forgot-password', validateBody(forgotPasswordBody), AuthController.forgotPassword);
router.post('/verify-forgot-password', validateBody(verifyForgotPasswordBody), AuthController.verifyForgotPassword);

module.exports = router;
