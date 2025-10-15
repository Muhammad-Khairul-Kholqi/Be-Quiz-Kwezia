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
            max: 50
        })
        .withMessage('Username harus 3-50 karakter')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username hanya boleh huruf, angka, dan underscore'),

        body('password')
        .isLength({
            min: 6
        })
        .withMessage('Password minimal 6 karakter'),
    ],

    loginValidation: [
        body('username')
        .trim()
        .notEmpty()
        .withMessage('Username wajib diisi'),

        body('password')
        .notEmpty()
        .withMessage('Password wajib diisi')
    ],

    validate: (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal',
                errors: errors.array()
            });
        }
        next();
    }
};

module.exports = validationMiddleware;
