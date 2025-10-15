const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

router.post(
    '/register',
    validationMiddleware.registerValidation,
    validationMiddleware.validate,
    authController.register
);

router.post(
    '/login',
    validationMiddleware.loginValidation,
    validationMiddleware.validate,
    authController.login
);

router.post(
    '/admin/login',
    validationMiddleware.loginValidation,
    validationMiddleware.validate,
    authController.adminLogin
);

router.get(
    '/profile',
    authMiddleware.verifyToken,
    authController.getProfile
);

module.exports = router;
