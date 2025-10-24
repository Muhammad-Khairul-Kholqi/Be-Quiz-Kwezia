const adminMiddleware = {
    verifyAdmin: (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required'
                });
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Authorization check failed',
                error: error.message
            });
        }
    }
};

module.exports = adminMiddleware;