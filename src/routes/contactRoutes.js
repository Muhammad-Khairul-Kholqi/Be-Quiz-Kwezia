const express = require('express');
const ContactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/submit', ContactController.submitContact);

router.get('/',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    ContactController.getAll
);

router.get('/unread',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    ContactController.getUnread
);

router.get('/unread-count',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    ContactController.getUnreadCount
);

router.get('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    ContactController.getById
);

router.patch('/:id/read',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    ContactController.markAsRead
);

router.patch('/:id/unread',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    ContactController.markAsUnread
);

router.delete('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    ContactController.delete
);

module.exports = router;