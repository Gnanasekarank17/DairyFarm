const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { googleSignIn, pinLogin, mobilePasswordLogin, updatePushToken, me } = require('../controllers/auth.controller');
const otpController = require('../controllers/otp.controller');

router.post('/google', googleSignIn);
router.post('/pin', pinLogin);
router.post('/mobile-login', mobilePasswordLogin);

// Mobile OTP verification (§4.2) — public, pre-registration
router.post('/otp/request', otpController.requestOtp);
router.post('/otp/resend', otpController.resendOtp);
router.post('/otp/verify', otpController.verifyOtp);
router.get('/otp/status', otpController.getStatus);

router.put('/push-token', authenticate, updatePushToken);
router.get('/me', authenticate, me);

module.exports = router;
