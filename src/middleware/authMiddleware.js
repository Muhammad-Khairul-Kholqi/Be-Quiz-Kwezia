const jwt = require('jsonwebtoken');

const authMiddleware = {
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization ?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid atau expired'
            });
        }
    },

    isAdmin: (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Hanya admin yang diizinkan'
            });
        }
        next();
    },

    isUser: (req, res, next) => {
        if (req.user.role !== 'user') {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Hanya user yang diizinkan'
            });
        }
        next();
    }
};

module.exports = authMiddleware;
