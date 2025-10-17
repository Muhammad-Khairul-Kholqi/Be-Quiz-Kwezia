const jwt = require('jsonwebtoken');

const authMiddleware = {
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization ?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token not found'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired'
            });
        }
    },

    isAdmin: (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admins only'
            });
        }
        next();
    },

    isUser: (req, res, next) => {
        if (req.user.role !== 'user') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Users only'
            });
        }
        next();
    }
};

module.exports = authMiddleware;
