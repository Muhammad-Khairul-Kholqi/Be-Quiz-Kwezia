const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
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


module.exports = router;