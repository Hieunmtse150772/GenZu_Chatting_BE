const router = require('express').Router();
const upload = require('multer')();

const AuthController = require('../controller/auth.controller');
const { validateBody } = require('@/middlewares/validator.middleware');
const {
    signUpBody,
    signInBody,
    changePasswordBody,
    forgotPasswordBody,
    verifyForgotPasswordBody,
    changeLanguageBody,
    verifyEmail,
} = require('@/validations');
const verifyToken = require('@/middlewares/verifyToken.middleware');

router.post('/sign-in', validateBody(signInBody), AuthController.signIn);
router.post('/sign-up', validateBody(signUpBody), AuthController.signUp);
router.get('/sign-in-google', AuthController.signInWithGoogle);
router.get('/callback', AuthController.callBack);
router.get('/profile', verifyToken, AuthController.profile);
router.post('/refresh-token', AuthController.refreshToken);
router.delete('/logout', AuthController.logout);
router.post('/resend-verify-email', AuthController.resendVerifyEmail);
router.post('/verify-email', validateBody(verifyEmail), AuthController.verifyEmail);
router.post('/change-password', verifyToken, validateBody(changePasswordBody), AuthController.changePassword);
router.post('/forgot-password', validateBody(forgotPasswordBody), AuthController.forgotPassword);
router.post('/verify-forgot-password', validateBody(verifyForgotPasswordBody), AuthController.verifyForgotPassword);
router.patch(
    '/update-language',
    verifyToken,
    upload.single(),
    validateBody(changeLanguageBody),
    AuthController.changeLanguage,
);

module.exports = router;
