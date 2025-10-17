const {
    body,
    validationResult
} = require('express-validator');

const validationMiddleware = {
    registerValidation: [
        body('username')
        .trim()
        .isLength({
            min: 3,
            max: 10
        })
        .withMessage('Username must be between 3 and 10 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

        body('password')
        .isLength({
            min: 6
        })
        .withMessage('Password must be at least 6 characters long'),
    ],

    loginValidation: [
        body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),

        body('password')
        .notEmpty()
        .withMessage('Password is required')
    ],

    validate: (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
};

module.exports = validationMiddleware;
